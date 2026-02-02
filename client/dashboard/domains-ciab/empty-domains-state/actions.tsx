import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { Icon, search, globe } from '@wordpress/icons';
import { useAnalytics } from '../../app/analytics';
import EmptyState from '../../components/empty-state';
import { wpcomLink } from '../../utils/link';

export default function EmptyDomainsStateActions() {
	const { recordTracksEvent } = useAnalytics();

	const trackEmptyStateActionClick = ( action: string ) => {
		recordTracksEvent( 'calypso_domains_dashboard_empty_state_action_click', {
			action,
			dashboard: 'ciab',
		} );
	};

	const handleSearchDomainsClick = () => {
		trackEmptyStateActionClick( 'search-domains' );
	};

	const handleTransferDomainClick = () => {
		trackEmptyStateActionClick( 'transfer-domain' );
	};

	return (
		<>
			<EmptyState.ActionList>
				<EmptyState.ActionItem
					title={ __( 'Search domain names' ) }
					description={ __( 'Find and register the perfect domain for your brand.' ) }
					decoration={ <Icon icon={ search } size={ 24 } /> }
					actions={
						<Button
							variant="secondary"
							href={ wpcomLink( '/setup/domain' ) }
							onClick={ handleSearchDomainsClick }
							size="compact"
							__next40pxDefaultSize
						>
							{ __( 'Search domains' ) }
						</Button>
					}
				/>
				<EmptyState.ActionItem
					title={ __( 'Use a domain name you already own' ) }
					description={ __(
						'Bring your domain to WordPress.com and manage everything in one place.'
					) }
					decoration={ <Icon icon={ globe } size={ 24 } /> }
					actions={
						<Button
							variant="secondary"
							href={ wpcomLink( '/setup/domain/use-my-domain' ) }
							onClick={ handleTransferDomainClick }
							size="compact"
							__next40pxDefaultSize
						>
							{ __( 'Use a domain name I own' ) }
						</Button>
					}
				/>
			</EmptyState.ActionList>
		</>
	);
}
