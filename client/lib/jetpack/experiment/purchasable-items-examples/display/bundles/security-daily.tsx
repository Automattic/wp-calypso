/**
 * External dependencies
 */
import React from 'react';
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { getJetpackCROActiveVersion } from 'calypso/my-sites/plans-v2/abtest';
import type { DisplayableItemProperties } from './types';

const currentCROVariant = getJetpackCROActiveVersion();

const DailyDisplayProperties: DisplayableItemProperties = {
	iconSlug: 'jetpack_security_v2',
	displayName: (
		<>
			{ currentCROVariant === 'v2'
				? translate( 'Jetpack Security {{em}}Daily{{/em}}', { components: { em: <em /> } } )
				: translate( 'Security {{em}}Daily{{/em}}', { components: { em: <em /> } } ) }
		</>
	),
	shortName: translate( 'Security {{em}}Daily{{/em}}', {
		components: {
			em: <em />,
		},
	} ),
	getTagline: () => {
		if ( currentCROVariant === 'v1' ) {
			return translate( 'Backup, Scan, and Anti-spam in one package' );
		}

		if ( currentCROVariant === 'v2' ) {
			return translate( 'Essential WordPress protection' );
		}

		return translate( 'Best for sites with occasional updates' );
	},
	callToAction: (
		<>
			{ translate( 'Get Security {{em}}Daily{{/em}}', {
				components: {
					em: <em />,
				},
			} ) }
		</>
	),
	description:
		currentCROVariant === 'v2'
			? translate(
					'All of the essential Jetpack Security features in one package including Backup, Scan, Anti-spam and more.'
			  )
			: translate(
					'Enjoy the peace of mind of complete site protection. ' +
						'Great for brochure sites, restaurants, blogs, and resume sites.'
			  ),
	features: [
		/* Not included, this is just an example */
	],
};

export default DailyDisplayProperties;
