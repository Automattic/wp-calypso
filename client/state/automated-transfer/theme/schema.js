/**
 * Internal dependencies
 */
import { upload } from '../upload-data/schema';

export const theme = {
	title: 'Theme which triggered transfer',
	type: 'object',
	properties: {
		id: {
			title: 'Slug-like theme ID',
			description: 'Once the server unpacks the theme it will respond with this slug.',
			type: 'string',
		},

		uploadData: upload,
	},
};
