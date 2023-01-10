// eslint-disable-next-line import/no-nodejs-modules
const { TextEncoder, TextDecoder } = require( 'util' );

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
