/* A real media item looks like this:
{
    "ID": 132,
    "URL": "https://example.files.wordpress.com/2015/05/g100.gif",
    "guid": "http://example.files.wordpress.com/2015/05/g100.gif",
    "date": "2015-05-08T00:46:18+00:00",
    "post_ID": 0,
    "file": "g100.gif",
    "mime_type": "image/gif",
    "extension": "gif",
    "title": "g100",
    "caption": "",
    "description": "",
    "alt": "",
    "thumbnails": {},
    "height": 5,
    "width": 6,
    "exif": {
        "aperture": 0,
        "credit": "",
        "camera": "",
        "caption": "",
        "created_timestamp": 0,
        "copyright": "",
        "focal_length": 0,
        "iso": 0,
        "shutter_speed": 0,
        "title": "",
        "orientation": 0
    },
    "meta": {
        "links": {
            "self": "https://public-api.wordpress.com/rest/v1.1/sites/2916284/media/132",
            "help": "https://public-api.wordpress.com/rest/v1.1/sites/2916284/media/132/help",
            "site": "https://public-api.wordpress.com/rest/v1.1/sites/2916284"
        }
    }
}
*/

module.exports = {
	media: [
		{
			ID: 1009,
			guid: 'http://example.files.wordpress.com/2015/05/g1009.gif',
			URL: 'http://example.files.wordpress.com/2015/05/g1009.gif',
			thumbnails: {
				medium: 'http://example.files.wordpress.com/2015/05/g1009-medium.gif'
			}
		}, {
			ID: 1008,
			guid: 'http://example.files.wordpress.com/2015/05/g1008.gif',
			URL: 'http://example.files.wordpress.com/2015/05/g1009.gif',
			thumbnails: {
				fmt_hd: 'http://example.files.wordpress.com/2015/05/g1009-hd.gif'
			}
		}, {
			ID: 1007,
			guid: 'http://example.files.wordpress.com/2015/05/g1007.gif'
		}, {
			ID: 1006,
			guid: 'http://example.files.wordpress.com/2015/05/g1006.gif'
		}, {
			ID: 1005,
			guid: 'http://example.files.wordpress.com/2015/05/g1005.gif'
		}, {
			ID: 1004,
			guid: 'http://example.files.wordpress.com/2015/05/g1004.gif'
		}, {
			ID: 1003,
			guid: 'http://example.files.wordpress.com/2015/05/g1003.gif'
		}, {
			ID: 1002,
			guid: 'http://example.files.wordpress.com/2015/05/g1002.gif'
		}, {
			ID: 1001,
			guid: 'http://example.files.wordpress.com/2015/05/g1001.gif'
		}, {
			ID: 1000,
			guid: 'http://example.files.wordpress.com/2015/05/g1000.gif'
		}
	]
};
