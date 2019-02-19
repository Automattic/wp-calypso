/** @format */

/**
 * External dependencies
 */

import { includes } from 'lodash';

export const isCrowdsignalOAuth2Client = oauth2Client => {
	return oauth2Client && oauth2Client.id === 978;
};

export const isWooOAuth2Client = oauth2Client => {
	return includes( [ 50019, 50915, 50916 ], oauth2Client.id );
};
