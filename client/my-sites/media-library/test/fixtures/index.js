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
 *     "name": "g100",
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
 *         "name": "",
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
		ID: '1000',
		URL: 'https://lh3.googleusercontent.com/1000',
		children: 2756,
		date: '2018-07-02T17:00:56+00:00',
		file: 'Album 1',
		name: 'Album 1',
		path: '1000',
		thumbnails: {
			large: 'https://lh3.googleusercontent.com/large-1000',
			medium: 'https://lh3.googleusercontent.com/medium-1000',
			'post-thumbnail': 'https://lh3.googleusercontent.com/post-thumbnail-1000',
			thumbnail: 'https://lh3.googleusercontent.com/thumbnail-1000',
		},
		type: 'folder',
	},
	{
		ID: '1001',
		URL: 'https://lh3.googleusercontent.com/1001',
		children: 10,
		date: '2018-07-02T17:00:56+00:00',
		file: 'Album 2',
		name: 'Album 2',
		path: '1001',
		thumbnails: {
			large: 'https://lh3.googleusercontent.com/large-1001',
			medium: 'https://lh3.googleusercontent.com/medium-1001',
			'post-thumbnail': 'https://lh3.googleusercontent.com/post-thumbnail-1001',
			thumbnail: 'https://lh3.googleusercontent.com/thumbnail-1001',
		},
		type: 'folder',
	},
	{
		ID: '1002',
		URL: 'https://lh3.googleusercontent.com/1002',
		children: 331,
		date: '2018-07-02T17:00:56+00:00',
		file: 'Album 3',
		name: 'Album 3',
		path: '1002',
		thumbnails: {
			large: 'https://lh3.googleusercontent.com/large-1002',
			medium: 'https://lh3.googleusercontent.com/medium-1002',
			'post-thumbnail': 'https://lh3.googleusercontent.com/post-thumbnail-1002',
			thumbnail: 'https://lh3.googleusercontent.com/thumbnail-1002',
		},
		type: 'folder',
	},
	{
		ID: '1003',
		URL: 'https://lh3.googleusercontent.com/1003',
		children: 23,
		date: '2018-07-02T17:00:56+00:00',
		file: 'Album 4',
		name: 'Album 4',
		path: '1003',
		thumbnails: {
			large: 'https://lh3.googleusercontent.com/large-1003',
			medium: 'https://lh3.googleusercontent.com/medium-1003',
			'post-thumbnail': 'https://lh3.googleusercontent.com/post-thumbnail-1003',
			thumbnail: 'https://lh3.googleusercontent.com/thumbnail-1003',
		},
		type: 'folder',
	},
];

export default {
	media,
	folders,
};
