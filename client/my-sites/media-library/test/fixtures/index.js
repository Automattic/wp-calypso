/**
 * /* A real media item looks like this:
 * {
 *     "ID": 132,
 *     "URL": "https:
 *     "guid": "http:
 *     "date": "2015-05-08T00:46:18+00:00",
 *     "post_ID": 0,
 *     "file": "g100.gif",
 *     "mime_type": "image/gif",
 *     "extension": "gif",
 *     "title": "g100",
 *     "caption": "",
 *     "description": "",
 *     "alt": "",
 *     "thumbnails": {},
 *     "height": 5,
 *     "width": 6,
 *     "exif": {
 *         "aperture": 0,
 *         "credit": "",
 *         "camera": "",
 *         "caption": "",
 *         "created_timestamp": 0,
 *         "copyright": "",
 *         "focal_length": 0,
 *         "iso": 0,
 *         "shutter_speed": 0,
 *         "title": "",
 *         "orientation": 0
 *     },
 *     "meta": {
 *         "links": {
 *             "self": "https:
 *             "help": "https:
 *             "site": "https:
 *         }
 *     }
 * }
 *
 * @format
 */

export const media = [
	{
		ID: 1009,
		guid: 'http://example.files.wordpress.com/2015/05/g1009.gif',
		date: '2017-09-15',
		URL: 'http://example.files.wordpress.com/2015/05/g1009.gif',
		thumbnails: {
			medium: 'http://example.files.wordpress.com/2015/05/g1009-medium.gif',
		},
	},
	{
		ID: 1008,
		guid: 'http://example.files.wordpress.com/2015/05/g1008.gif',
		date: '2017-09-15',
		URL: 'http://example.files.wordpress.com/2015/05/g1009.gif',
		thumbnails: {
			fmt_hd: 'http://example.files.wordpress.com/2015/05/g1009-hd.gif',
		},
	},
	{
		ID: 1007,
		guid: 'http://example.files.wordpress.com/2015/05/g1007.gif',
		date: '2017-09-15',
	},
	{
		ID: 1006,
		guid: 'http://example.files.wordpress.com/2015/05/g1006.gif',
		date: '2017-09-08',
	},
	{
		ID: 1005,
		guid: 'http://example.files.wordpress.com/2015/05/g1005.gif',
		date: '2017-09-07',
	},
	{
		ID: 1004,
		guid: 'http://example.files.wordpress.com/2015/05/g1004.gif',
		date: '2017-09-06',
	},
	{
		ID: 1003,
		guid: 'http://example.files.wordpress.com/2015/05/g1003.gif',
		date: '2017-09-05',
	},
	{
		ID: 1002,
		guid: 'http://example.files.wordpress.com/2015/05/g1002.gif',
		date: '2017-09-04',
	},
	{
		ID: 1001,
		guid: 'http://example.files.wordpress.com/2015/05/g1001.gif',
		date: '2017-09-03',
	},
	{
		ID: 1000,
		guid: 'http://example.files.wordpress.com/2015/05/g1000.gif',
		date: '2017-09-02',
	},
];

export const folders = [
	{
		ID: 1000,
		title: 'Album 1',
		summary: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit',
		thumbnail: 'http://example.files.wordpress.com/2015/05/g1000.gif',
		numphotos: 278,
		date: '2017-05-01',
	},
	{
		ID: 1001,
		title: 'Album 2',
		summary: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit',
		thumbnail: 'http://example.files.wordpress.com/2015/05/g1000.gif',
		numphotos: 23,
		date: '2012-09-04',
	},
	{
		ID: 1002,
		title: 'Album 3',
		summary: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit',
		thumbnail: 'http://example.files.wordpress.com/2015/05/g1000.gif',
		numphotos: 2,
		date: '2015-09-04',
	},
	{
		ID: 1003,
		title: 'Album 4',
		summary: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit',
		thumbnail: 'http://example.files.wordpress.com/2015/05/g1000.gif',
		numphotos: 1000,
		date: '2017-09-27',
	},
	{
		ID: 1004,
		title: 'Album 5',
		summary: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit',
		thumbnail: 'http://example.files.wordpress.com/2015/05/g1000.gif',
		numphotos: 485,
		date: '2017-10-04',
	},
];

export default {
	media,
	folders,
};
