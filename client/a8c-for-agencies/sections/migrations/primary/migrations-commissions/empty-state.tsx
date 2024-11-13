import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import StepSection from 'calypso/a8c-for-agencies/components/step-section';
import StepSectionItem from 'calypso/a8c-for-agencies/components/step-section-item';
import { preventWidows } from 'calypso/lib/formatting';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

export default function MigrationsCommissionsEmptyState( {
	setShowAddSitesModal,
}: {
	setShowAddSitesModal: ( show: boolean ) => void;
} ) {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const onTagMySelfMigratedSitesClick = useCallback( () => {
		dispatch(
			recordTracksEvent( 'calypso_a8c_migrations_commissions_tag_my_self_migrated_sites_click' )
		);
		setShowAddSitesModal( true );
	}, [ dispatch, setShowAddSitesModal ] );

	const a4aPluginUrl = 'https://wordpress.org/plugins/automattic-for-agencies-client';

	return (
		<StepSection heading={ translate( 'View your migrated websites and commisions right here.' ) }>
			<StepSectionItem
				isNewLayout
				heading={ translate( "We'll tag the sites we moved for you once they're transferred." ) }
				description={ preventWidows(
					translate(
						"If you picked the concierge service, we'll move your sites for you. Once we're done, you'll see them here, and they'll add to your commissions."
					)
				) }
			/>
			<StepSectionItem
				isNewLayout
				heading={ translate( 'Tag your transferred sites so we can pay you for them.' ) }
				description={
					<>
						{ translate(
							'If you transferred sites by yourself, follow these two steps to indicate which ones we should pay you for.'
						) }

						<ul>
							<li>
								{ translate(
									'Ensure the {{a}}Automattic for Agencies plugin{{/a}} ↗ is installed and connected to each site.',
									{
										components: {
											a: (
												<a
													target="_blank"
													href={ a4aPluginUrl }
													onClick={ () => {
														dispatch(
															recordTracksEvent(
																'calypso_a8c_migrations_commissions_a4a_plugin_link_click'
															)
														);
													} }
													rel="noopener noreferrer"
												/>
											),
										},
									}
								) }
							</li>
							<li>{ translate( 'Tag the connected sites using the button below..' ) }</li>
						</ul>

						<Button variant="primary" onClick={ onTagMySelfMigratedSitesClick }>
							{ translate( 'Tag my self-migrated sites' ) }
						</Button>
					</>
				}
			/>
		</StepSection>
	);
}
