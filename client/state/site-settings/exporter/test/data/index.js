/**
 * This file contains data for use in tests in the form it could be expected
 * to be received from the wpcom API
 */

export const SAMPLE_ADVANCED_SETTINGS = {
	feedback: [],
	page: {
		authors: [ { ID: 95752520, name: 'Test User', login: 'testuser' } ],
		export_date_options: [
			{ year: '2015', month: '11' },
			{ year: '2015', month: '10' }
		],
		statuses: [ { label: 'Published', name: 'publish' } ]
	},
	post: {
		categories: [ { name: 'Uncategorized' } ],
		authors: [ { ID: 95752520, name: 'Test User', login: 'testuser' } ],
		export_date_options: [
			{ year: '2015', month: '11' },
			{ year: '2015', month: '10' }
		],
		statuses: [ { label: 'Published', name: 'publish' } ]
	}
}

export const SAMPLE_ADVANCED_SETTINGS_EMPTY = {
	feedback: [],
	page: {
		authors: [],
		export_date_options: [],
		statuses: [ { label: 'Published', name: 'publish' } ]
	},
	post: {
		categories: [ { name: 'Uncategorized' } ],
		authors: [],
		export_date_options: [],
		statuses: [ { label: 'Published', name: 'publish' } ]
	}
}

export const SAMPLE_EXPORT_COMPLETE_RESPONSE = {
	status: 'finished',
	export_file_lifetime_days: 7,
	$attachment_url: 'https://exports.files.wordpress.com/2016/02/not-a-real-file.zip'
}

export const SAMPLE_EXPORT_RUNNING_RESPONSE = {
	status: 'running'
}

export const SAMPLE_EXPORT_FAILED_RESPONSE = {
	status: 'failed'
}
