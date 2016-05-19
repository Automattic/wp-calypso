/**
 * This file contains data for use in tests in the form it could be expected
 * to be received from the wpcom API
 */

export const SAMPLE_ADVANCED_SETTINGS = {
	feedback: [],
	page: {
		authors: [ { value: 95752520, label: 'Test User' } ],
		dates: [
			{ value: '2015-11', label: 'Nov 2015' },
			{ value: '2015-10', label: 'Oct 2015' }
		],
		statuses: [ { label: 'Published', value: 'publish' } ]
	},
	post: {
		categories: [ { label: 'Uncategorized', value: 1 } ],
		authors: [ { value: 95752520, label: 'Test User' } ],
		dates: [
			{ value: '2015-11', label: 'Nov 2015' },
			{ value: '2015-10', label: 'Oct 2015' }
		],
		statuses: [ { label: 'Published', value: 'publish' } ]
	}
};

export const SAMPLE_ADVANCED_SETTINGS_EMPTY = {
	feedback: [],
	page: {
		authors: [],
		dates: [],
		statuses: [ { label: 'Published', value: 'publish' } ]
	},
	post: {
		categories: [ { label: 'Uncategorized', value: 1 } ],
		authors: [],
		dates: [],
		statuses: [ { label: 'Published', value: 'publish' } ]
	}
};

export const SAMPLE_EXPORT_COMPLETE_RESPONSE = {
	status: 'finished',
	export_file_lifetime_days: 7,
	$attachment_url: 'https://example.files.wordpress.com/2016/02/not-a-real-file.zip'
};

export const SAMPLE_EXPORT_RUNNING_RESPONSE = {
	status: 'running'
};

export const SAMPLE_EXPORT_FAILED_RESPONSE = {
	status: 'failed'
};
