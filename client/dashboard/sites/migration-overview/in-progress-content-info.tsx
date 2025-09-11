import { __experimentalVStack as VStack } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { PageHeader } from '../../components/page-header';
import { HostingCards } from './hosting-cards';
import type { Site } from '@automattic/api-core';

export function InProgressContentInfo( { site }: { site: Site } ) {
	const sourceSiteDomain = site.options?.migration_source_site_domain;

	return (
		<VStack spacing={ 8 }>
			<PageHeader
				title={ __( 'Your migration is underway' ) }
				description={ createInterpolateElement(
					sprintf(
						// translators: siteName is site domain that is being migrated
						__(
							'Sit back as <strong>%(siteName)s</strong> transfers to its new home. Get ready for unmatched WordPress hosting.'
						),
						{
							siteName: sourceSiteDomain,
						}
					),
					{
						strong: <strong />,
					}
				) }
			/>
			<HostingCards />
		</VStack>
	);
}
