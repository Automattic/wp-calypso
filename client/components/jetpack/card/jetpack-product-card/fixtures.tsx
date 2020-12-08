/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';
import React from 'react';

// TODO: replace this hardcoded data with real data when we have an endpoint for it or
// a more definitive place in our own codebase.
export const DEFAULT_UPGRADE_NUDGE_FEATURES = [
	{
		text: translate(
			'{{strong}}Backup {{em}}Real-time{{/em}}{{/strong}} Backs up your site as you edit',
			{
				components: {
					strong: <strong />,
					em: <em />,
				},
			}
		),
	},
	{
		text: translate( '{{strong}}Scan {{em}}Real-time{{/em}}{{/strong}} Always-on site protection', {
			components: {
				strong: <strong />,
				em: <em />,
			},
		} ),
	},
	{
		text: translate( 'All Jetpack security features for comprehensive protection' ),
	},
];
