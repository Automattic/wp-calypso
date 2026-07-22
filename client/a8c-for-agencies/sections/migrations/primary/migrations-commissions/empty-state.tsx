import { Button, ExternalLink } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useCallback } from 'react';
import StepSection from '../../commissions/components/step-section';
import StepSectionItem from '../../commissions/components/step-section-item';
import type { RecordTracksEvent } from 'calypso/dashboard/agency/earn/migrations/types';

export default function MigrationsCommissionsEmptyState( {
	recordTracksEvent,
	onTagSitesClick,
	canTagSitesForCommission,
}: {
	recordTracksEvent: RecordTracksEvent;
	onTagSitesClick: () => void;
	canTagSitesForCommission: boolean;
} ) {
	const onTagMySelfMigratedSitesClick = useCallback( () => {
		recordTracksEvent( 'calypso_a8c_migrations_commissions_tag_my_self_migrated_sites_click' );
		onTagSitesClick();
	}, [ recordTracksEvent, onTagSitesClick ] );

	const a4aPluginUrl = 'https://wordpress.org/plugins/automattic-for-agencies-client';

	return (
		<StepSection heading={ __( 'View your migrated websites and commissions right here.' ) }>
			<StepSectionItem
				heading={ __( 'Concierge Migrations' ) }
				description={ __(
					'If you picked the concierge service, we’ll move your sites for you. Once we’re done, you’ll see them here and they’ll be available for tagging.'
				) }
			/>
			{ canTagSitesForCommission && (
				<StepSectionItem
					heading={ __( 'Tag your transferred sites so we can pay you for them.' ) }
					description={
						<>
							{ __(
								'If you transferred sites by yourself, follow these two steps to indicate which ones we should pay you for.'
							) }

							<ul>
								<li>
									{ createInterpolateElement(
										__(
											'Ensure the <a>Automattic for Agencies plugin</a> is installed and connected to each site.'
										),
										{
											a: (
												<ExternalLink
													children={ null }
													href={ a4aPluginUrl }
													onClick={ () => {
														recordTracksEvent(
															'calypso_a8c_migrations_commissions_a4a_plugin_link_click'
														);
													} }
												/>
											),
										}
									) }
								</li>
								<li>{ __( 'Tag the connected sites using the button below.' ) }</li>
							</ul>

							<Button variant="primary" onClick={ onTagMySelfMigratedSitesClick }>
								{ __( 'Tag my self-migrated sites' ) }
							</Button>
						</>
					}
				/>
			) }
		</StepSection>
	);
}
