const request = require('request');
const fs = require('fs');

const url = 'https://public-api.wordpress.com/rest/v1/nux/starter-designs/';
request( url ).pipe( fs.createWriteStream( './test/visual/themesData.json' ) );
