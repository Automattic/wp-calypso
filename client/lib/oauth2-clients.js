/** @format */

/**
 * External dependencies
 */

import { includes } from 'lodash';

export const isWooOAuth2Client = oauth2Client => {
	return includes( [ 50019, 50915, 50916 ], oauth2Client.id );
};
