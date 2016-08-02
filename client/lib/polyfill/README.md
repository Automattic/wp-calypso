Polyfill
========

Polyfill is a library which, when loaded in the context of a browser, will automatically polyfill behavior assumed to be present in the Calypso codebase.

In particular, this invokes a polyfill for localStorage using an in-memory store for environments where either localStorage does not exist or invokes errors when used (e.g. Safari Private Browsing mode). See the [polyfill's README.md](../local-storage/README.md) for more information.
