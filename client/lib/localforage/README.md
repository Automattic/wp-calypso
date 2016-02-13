localforage
=============

This exports a getLocalForage function which returns a localforage instance that has been setup with our default Calypso 
config.

## Usage:

```
import { getLocalForage } from 'lib/localforage';
const localforage = getLocalForage();

//use localforage as you would normally
localforage.getItem( 'my-stored-key', callback );

```

Also see: https://github.com/mozilla/localForage#configuration