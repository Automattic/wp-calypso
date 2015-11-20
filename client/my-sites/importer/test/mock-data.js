/**
 * Internal dependencies
 */
import { appStates, importerTypes } from 'lib/importer/constants';

/**
 * Module variables
 */
const testBlog = 68410886,
	testDate = ( new Date() ).toISOString(),
	testFilename = 'wp-export-2015.xml',
	testSiteTitle = 'Feline Justice League',
	testSlug = 'wordbacon.wordpress.com';

var mockData = {
	componentStates: [
		{
			name: 'Blank Slate',
			payload: {
				count: 0,
				importers: []
			}
		},
		{
			name: 'WP Active',
			payload: {
				count: 1,
				importers: [
					{
						type: importerTypes.WORDPRESS,
						site: {
							ID: testBlog,
							slug: testSlug
						},
						importerState: appStates.READY_FOR_UPLOAD
					}
				]
			}
		},
		{
			name: 'WP Uploading File',
			payload: {
				count: 1,
				importers: [
					{
						id: 1,
						type: importerTypes.WORDPRESS,
						site: {
							ID: testBlog,
							slug: testSlug
						},
						importerState: appStates.UPLOADING,
						filename: testFilename
					}
				]
			}
		},
		{
			name: 'WP Upload: Timeout',
			payload: {
				count: 1,
				importers: [
					{
						id: 1,
						type: importerTypes.WORDPRESS,
						site: {
							ID: testBlog,
							slug: testSlug
						},
						timeout: testDate,
						importerState: appStates.UPLOAD_FAILURE,
						filename: testFilename,
						errorData: {
							type: 'timeout',
							description: 'The upload did not complete quickly enough and the server stopped waiting for it.'
						}
					}
				]
			}
		},
		{
			name: 'WP Upload: Corrupt File',
			payload: {
				count: 1,
				importers: [
					{
						id: 1,
						type: importerTypes.WORDPRESS,
						site: {
							ID: testBlog,
							slug: testSlug
						},
						timeout: testDate,
						importerState: appStates.UPLOAD_FAILURE,
						filename: testFilename,
						errorData: {
							type: 'corruptFile',
							description: 'The file upload could not complete or completed with errors.'
						}
					}
				]
			}
		},
		{
			name: 'WP Upload: Success',
			payload: {
				count: 1,
				importers: [
					{
						id: 1,
						type: importerTypes.WORDPRESS,
						site: {
							ID: testBlog,
							slug: testSlug
						},
						timeout: testDate,
						importerState: appStates.UPLOAD_SUCCESS,
						filename: testFilename
					}
				]
			}
		},
		{
			name: 'WP Import: Parse Error',
			payload: {
				count: 1,
				importers: [
					{
						id: 1,
						type: importerTypes.WORDPRESS,
						site: {
							ID: testBlog,
							slug: testSlug
						},
						timeout: testDate,
						importerState: appStates.IMPORT_FAILURE,
						errorData: {
							type: 'parseError',
							description: 'The imported file does not appear to be a valid WordPress export.'
						}
					}
				]
			}
		},
		{
			name: 'WP Import: Map Authors',
			payload: {
				count: 1,
				importers: [
					{
						id: 1,
						type: importerTypes.WORDPRESS,
						timeout: testDate,
						importerState: appStates.MAP_AUTHORS,
						counts: {
							posts: 14,
							attachments: 17,
							comments: 24
						},
						customData: {
							siteTitle: testSiteTitle,
							sourceAuthors: [
								{
									id: 2,
									name: 'Leeroy Jenkins',
									url: 'youtube.com',
									counts: { posts: 6 }
								},
								{
									id: 8,
									name: 'Benedict Benedictus',
									url: 'benedi.ct',
									counts: { posts: 8 }
								}
							]
						}
					}
				]
			}
		},
		{
			name: 'WP Import: Map Authors (one mapped)',
			payload: {
				count: 1,
				importers: [
					{
						id: 1,
						type: importerTypes.WORDPRESS,
						timeout: testDate,
						importerState: appStates.MAP_AUTHORS,
						counts: {
							posts: 14,
							attachments: 17,
							comments: 24
						},
						customData: {
							siteTitle: testSiteTitle,
							sourceAuthors: [
								{
									id: 2,
									name: 'Leeroy Jenkins',
									url: 'youtube.com',
									counts: { posts: 6 },
									mappedTo: {
										ID: 69571376,
										name: 'Notifications Test',
										avatar_URL: 'https://secure.gravatar.com/avatar/9b81e82f7accedf66c3f7f1564705b20?s=256&r=any&time=48075828'
									}
								},
								{
									id: 8,
									name: 'Benedict Benedictus',
									url: 'benedi.ct',
									counts: { posts: 8 }
								}
							]
						}
					}
				]
			}
		},
		{
			name: 'WP Import: Map Authors (five source)',
			payload: {
				count: 1,
				importers: [
					{
						id: 1,
						type: importerTypes.WORDPRESS,
						timeout: testDate,
						importerState: appStates.MAP_AUTHORS,
						counts: {
							posts: 14,
							attachments: 17,
							comments: 24
						},
						customData: {
							siteTitle: testSiteTitle,
							sourceAuthors: [
								{
									id: 2,
									name: 'Leeroy Jenkins',
									url: 'youtube.com',
									counts: { posts: 6 }
								},
								{
									id: 8,
									name: 'Benedict Benedictus',
									url: 'benedi.ct',
									counts: { posts: 8 },
									mappedTo: {
										ID: 69571376,
										name: 'Notifications Test',
										avatar_URL: 'https://secure.gravatar.com/avatar/9b81e82f7accedf66c3f7f1564705b20?s=256&r=any&time=48075828'
									}
								},
								{
									id: 12,
									name: 'Crazy Eddie',
									url: 'vhf.film',
									counts: { posts: 1 }
								},
								{
									id: 13,
									name: 'Max Headroom',
									url: 'ha.ck',
									counts: { posts: 373 },
									mappedTo: {
										ID: 467503,
										name: 'zvwmbx',
										avatar_URL: 'https://secure.gravatar.com/avatar/13f62a1b5296deacd1488a8687ec53c2?s=256&r=any&time=48075830'
									}
								},
								{
									id: 16,
									name: 'Zirocuhl',
									url: 'gibs.on',
									counts: { posts: 0 }
								}
							]
						}
					}
				]
			}
		},
		{
			name: 'WP Importing',
			payload: {
				count: 1,
				importers: [
					{
						id: 1,
						type: importerTypes.WORDPRESS,
						site: {
							ID: testBlog,
							slug: testSlug
						},
						timeout: testDate,
						importerState: appStates.IMPORTING,
						percentComplete: 63,
						statusMessage: 'Importing Posts',
						counts: {
							posts: 14,
							attachments: 17,
							comments: 24
						},
						customData: { siteTitle: testSiteTitle }
					}
				]
			}
		},
		{
			name: 'WP Import: Success (only pages)',
			payload: {
				count: 1,
				importers: [
					{
						id: 1,
						type: importerTypes.WORDPRESS,
						site: {
							ID: testBlog,
							slug: testSlug
						},
						timeout: testDate,
						importerState: appStates.IMPORT_SUCCESS,
						counts: {
							pages: 14,
							attachments: 17,
							comments: 24
						},
						customData: { siteTitle: testSiteTitle }
					}
				]
			}
		},
		{
			name: 'WP Import: Success (only posts)',
			payload: {
				count: 1,
				importers: [
					{
						id: 1,
						type: importerTypes.WORDPRESS,
						site: {
							ID: testBlog,
							slug: testSlug
						},
						timeout: testDate,
						importerState: appStates.IMPORT_SUCCESS,
						counts: {
							posts: 14,
							attachments: 17,
							comments: 24
						},
						customData: { siteTitle: testSiteTitle }
					}
				]
			}
		},
		{
			name: 'WP Import: Success (pages and posts)',
			payload: {
				count: 1,
				importers: [
					{
						id: 1,
						type: importerTypes.WORDPRESS,
						site: {
							ID: testBlog,
							slug: testSlug
						},
						timeout: testDate,
						importerState: appStates.IMPORT_SUCCESS,
						counts: {
							pages: 3,
							posts: 14,
							attachments: 17,
							comments: 24
						},
						customData: { siteTitle: testSiteTitle }
					}
				]
			}
		}
	]
};

module.exports = mockData;
