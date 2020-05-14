# API

List of supported endpoints:

- `/version` - it serves version fetched from _package.json_.
- `/oauth` - proxies an oauth login to the WP.com API. Only enabled with the `oauth` feature
- `/logout` - removes the wpcom_token cookie and redirects to the logout_url
