safe-image-url
=======
This is a small module that takes a URL to a supposed image and returns
a safe version of it, guaranteed to be hosted by Automattic. If the URL
appears to be from an Automattic-controlled CDN, it is simply flipped to
a protocol-relative URL. If it is not on an Automattic-controlled CDN, the
URL is changed to route through photon.
