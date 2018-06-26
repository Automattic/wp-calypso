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
		value: 'album-1',
		label: 'Album 1',
		count: 9,
	},
	{
		value: 'album-2',
		label: 'Album 2',
		count: 29,
	},
	{
		value: 'album-3',
		label: 'Album 3',
		count: 52,
	},
	{
		value: 'album-4',
		label: 'Album 4',
		count: 18,
	},
];

export default {
	media,
	folders,
};
