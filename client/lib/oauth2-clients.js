/**
 * External dependencies
 */

import { includes } from 'lodash';

export const isCrowdsignalOAuth2Client = ( oauth2Client ) => {
	return oauth2Client && oauth2Client.id === 978;
};

export const isWooOAuth2Client = ( oauth2Client ) => {
	// 50019 => WooCommerce Dev, 50915 => WooCommerce Staging, 50916 => WooCommerce Production.
	return oauth2Client && includes( [ 50019, 50915, 50916 ], oauth2Client.id );
};

export const isJetpackCloudOAuth2Client = ( oauth2Client ) => {
	// 68663 => Jetpack Cloud Dev,
	return oauth2Client && includes( [ 68663, 69040, 69041 ], oauth2Client.id );
};
