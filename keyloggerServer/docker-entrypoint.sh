#!/bin/bash
set -e

setup_haproxy_keys () {
	CN=${HOOK_HOST:-collector}
	KEY='/data/haproxy/collector.key'
	CSR='/data/haproxy/collector.csr'
	CRT='/data/haproxy/collector.crt'
	PEM='/data/haproxy/collector.pem'
	CA_KEY='/data/mitmproxy/mitmproxy-ca.pem'
	CA_CRT=$CA_KEY

	if [ -e $PEM ]
	then
		return 0
	elif [ ! -e $CA_KEY ] || [ ! -e $CA_CRT ]
	then
		echo "Mitmproxy CA's keys not found"
		return 1
	fi

	echo 'Generating SSL keys ...'
	openssl genrsa -out $KEY 2048
	openssl req -new -sha256 -key $KEY -subj "/C=US/ST=CA/O=MyOrg, Inc./CN=$CN" -out $CSR
	openssl x509 -req -in $CSR -CA $CA_CRT -CAkey $CA_KEY -CAcreateserial -out $CRT -days 500 -sha256

	cat $KEY $CRT > $PEM
}


sleep 1
setup_haproxy_keys

chmod +x /app/keylogger_server.py
exec /app/keylogger_server.py "$@"
