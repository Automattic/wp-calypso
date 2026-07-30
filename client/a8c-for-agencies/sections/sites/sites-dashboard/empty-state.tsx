import { __experimentalText as Text, __experimentalVStack as VStack } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { preventWidows } from 'calypso/lib/formatting';

import './empty-state.scss';

export type SitesEmptyStateVariant = 'no-sites' | 'no-favorites' | 'no-development';

export default function SitesDashboardEmptyState( {
	variant,
}: {
	variant: SitesEmptyStateVariant;
} ) {
	const translate = useTranslate();

	const content: Record< SitesEmptyStateVariant, { title: string; message: string } > = {
		'no-sites': {
			title: translate( 'Add your first site' ),
			message: translate(
				'To get started, add a site using the “Add sites” button at the top of the page.'
			),
		},
		'no-favorites': {
			title: translate( 'No favorite sites yet' ),
			message: translate( 'Mark a site as a favorite with the star icon to quickly find it here.' ),
		},
		'no-development': {
			title: translate( 'No development sites yet' ),
			message: translate(
				'Create a free development site using the “Add sites” button at the top of the page.'
			),
		},
	};

	const { title, message } = content[ variant ];

	return (
		<div className="sites-dashboard__empty-state">
			<VStack spacing={ 2 } alignment="center">
				<Text size={ 20 } weight={ 600 }>
					{ title }
				</Text>
				<Text variant="muted">{ preventWidows( message ) }</Text>
			</VStack>
		</div>
	);
}
