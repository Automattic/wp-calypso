import Lru from 'lru';

const stateCache = new Lru( 500 );

export default stateCache;
