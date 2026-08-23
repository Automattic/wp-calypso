import { useQuery } from '@tanstack/react-query';
import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { Icon, cloud } from '@wordpress/icons';
import { useAnalytics } from '../../app/analytics';
import { useAppContext } from '../../app/context';
import EmptyState from '../../components/empty-state';

export function useHasHiddenStagingSites( enabled: boolean ) {
	const { queries } = useAppContext();
	const { data } = useQuery( {
		...queries.paginatedSitesQuery( {
			site_visibility: 'visible',
			include_a8c_owned: false,
			include_staging: true,
			page: 1,
			per_page: 1,
		} ),
		enabled,
	} );

	return ( data?.total ?? 0 ) > 0;
}

export function HiddenStagingSitesAction( { onShow }: { onShow: () => void } ) {
	const { recordTracksEvent } = useAnalytics();

	return (
		<EmptyState.ActionList>
			<EmptyState.ActionItem
				title={ __( 'Looking for a staging site?' ) }
				description={ __(
					'Staging sites are hidden from this list. You can show them with the “Staging sites” filter.'
				) }
				decoration={ <Icon icon={ cloud } size={ 24 } /> }
				actions={
					<Button
						variant="secondary"
						onClick={ () => {
							recordTracksEvent( 'calypso_sites_dashboard_empty_state_action_click', {
								action: 'show-staging-sites',
							} );
							onShow();
						} }
						size="compact"
						__next40pxDefaultSize
					>
						{ __( 'Show staging sites' ) }
					</Button>
				}
			/>
		</EmptyState.ActionList>
	);
}
