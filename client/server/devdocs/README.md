# Devdocs: In-app documentation browser (server)

Devdocs is a built-in search engine that allows developers and users to browse and search Calypso’s developer documentation.

This directory contains the server portion of the implementation, which uses [lunr.js](https://lunrjs.com/) to index and query the documents. We do some pre-processing of the indexed docs to remove Markdown punctuation so that snippets are easier to read. Full rendered HTML of the documents is available via the `/devdocs/content` endpoint.

Endpoints:

- `/devdocs/query?q=term1%20term2` searches and ranks documents according to the query
- `/devdocs/query?files=client%2FREADME.md,CONTRIBUTING.md` lists documents by name
- `/devdocs/content?path=client%2FREADME.md` returns the content of the document, rendered as HTML
