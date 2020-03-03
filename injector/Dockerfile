FROM mitmproxy/mitmproxy:5.0.1

WORKDIR /app
COPY src/requirements.txt .
RUN pip install -r requirements.txt

COPY src/ .

EXPOSE 8080
ENTRYPOINT ["mitmdump", "-smitmproxy_inject.py", "--mode=regular", "--ssl-insecure"]
