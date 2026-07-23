import { Button, ExternalLink } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useCallback } from 'react';
import EmptyState from '../../../components/empty-state';
import type { RecordTracksEvent } from './types';

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
		<EmptyState.Wrapper>
			<EmptyState>
				<EmptyState.Header>
					<EmptyState.Title>
						{ __( 'View your migrated websites and commissions right here.' ) }
					</EmptyState.Title>
				</EmptyState.Header>
				<EmptyState.Content>
					<EmptyState.ActionList>
						<EmptyState.ActionItem
							title={ __( 'Concierge Migrations' ) }
							description={ __(
								'If you picked the concierge service, we’ll move your sites for you. Once we’re done, you’ll see them here and they’ll be available for tagging.'
							) }
							actions={ null }
						/>
						{ canTagSitesForCommission && (
							<EmptyState.ActionItem
								title={ __( 'Tag your transferred sites so we can pay you for them.' ) }
								description={
									<>
										{ __(
											'If you transferred sites by yourself, follow these two steps to indicate which ones we should pay you for.'
										) }
										<ol>
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
										</ol>
									</>
								}
								actions={
									<Button variant="primary" onClick={ onTagMySelfMigratedSitesClick }>
										{ __( 'Tag my self-migrated sites' ) }
									</Button>
								}
							/>
						) }
					</EmptyState.ActionList>
				</EmptyState.Content>
			</EmptyState>
		</EmptyState.Wrapper>
	);
}
