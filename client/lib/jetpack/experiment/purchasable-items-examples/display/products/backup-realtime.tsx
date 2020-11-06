/**
 * External dependencies
 */
import React from 'react';
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { AppState } from 'calypso/types';
import { getJetpackCROActiveVersion } from 'calypso/my-sites/plans-v2/abtest';
import type { DisplayableItemProperties } from './types';

const currentCROVariant = getJetpackCROActiveVersion();

const RealtimeDisplayProperties: DisplayableItemProperties = {
	iconSlug: 'jetpack_backup_v2',
	displayName: (
		<>
			{ currentCROVariant === 'v2'
				? translate( 'Jetpack Backup {{em}}Real-Time{{/em}}', { components: { em: <em /> } } )
				: translate( 'Backup {{em}}Real-Time{{/em}}', { components: { em: <em /> } } ) }
		</>
	),
	shortName: translate( 'Backup {{em}}Real-time{{/em}}', {
		components: {
			em: <em />,
		},
	} ),
	getTagline: ( state: AppState ) => {
		const isOwned = ( ( s ) => !! s )( state );

		return isOwned
			? translate( 'Your site is actively being backed up' )
			: translate( 'Best for sites with frequent updates' );
	},
	callToAction: (
		<>
			{ translate( 'Get Backup {{em}}Real-Time{{/em}}', {
				components: {
					em: <em />,
				},
			} ) }
		</>
	),
	description: translate( 'Never lose a word, image, page, or time worrying about your site.' ),
	features: [
		/* Not included, this is just an example */
	],
};

export default RealtimeDisplayProperties;
