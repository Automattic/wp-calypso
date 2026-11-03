import { __experimentalVStack as VStack } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { HostingCards } from './hosting-cards';
import { MigrationCard, StatusIcon } from './wordpress/migration-card';
import type { Site } from '@automattic/api-core';

export function InProgressContentInfo( { site }: { site: Site } ) {
	const sourceSiteDomain = site.options?.migration_source_site_domain;

	return (
		<VStack spacing={ 6 }>
			<MigrationCard
				title={ __( 'Your migration is underway' ) }
				decoration={ <StatusIcon status="pending" /> }
				description={ createInterpolateElement(
					__(
						'Sit back as <siteName /> transfers to its new home. Get ready for unmatched WordPress hosting.'
					),
					{
						siteName: sourceSiteDomain ? (
							<strong>{ sourceSiteDomain.replace( /^https?:\/\/|\/+$/g, '' ) }</strong>
						) : (
							<span>{ __( 'your site' ) }</span>
						),
					}
				) }
			/>
			<HostingCards />
		</VStack>
	);
}
