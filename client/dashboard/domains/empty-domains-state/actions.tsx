import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { Icon, search, globe } from '@wordpress/icons';
import { useAnalytics } from '../../app/analytics';
import { useAppContext } from '../../app/context';
import EmptyState from '../../components/empty-state';
import { wpcomLink } from '../../utils/link';

export default function EmptyDomainsStateActions() {
	const { recordTracksEvent } = useAnalytics();
	const { name } = useAppContext();
	const isCiab = name === 'CIAB';

	const trackEmptyStateActionClick = ( action: string ) => {
		recordTracksEvent( 'calypso_domains_dashboard_empty_state_action_click', {
			action,
			dashboard: isCiab ? 'ciab' : 'msd',
		} );
	};

	const handleSearchDomainsClick = () => {
		trackEmptyStateActionClick( 'search-domains' );
	};

	const handleTransferDomainClick = () => {
		trackEmptyStateActionClick( 'transfer-domain' );
	};

	const searchUrl = isCiab ? '/setup/domain' : '/start/domain';
	const transferUrl = isCiab ? '/setup/domain/use-my-domain' : '/setup/domain-transfer';
	const transferTitle = isCiab
		? __( 'Use a domain name you already own' )
		: __( 'Transfer a domain you already own' );
	const transferDescription = isCiab
		? __( 'Bring your domain to WordPress.com and manage everything in one place.' )
		: __( 'Move your domain to WordPress.com and manage everything in one place.' );
	const transferButtonLabel = isCiab ? __( 'Use a domain name I own' ) : __( 'Start transfer' );

	return (
		<EmptyState.ActionList>
			<EmptyState.ActionItem
				title={ __( 'Search domain names' ) }
				description={ __( 'Find and register the perfect domain for your brand.' ) }
				decoration={ <Icon icon={ search } size={ 24 } /> }
				actions={
					<Button
						variant="secondary"
						href={ wpcomLink( searchUrl ) }
						onClick={ handleSearchDomainsClick }
						size="compact"
						__next40pxDefaultSize
					>
						{ __( 'Search domains' ) }
					</Button>
				}
			/>
			<EmptyState.ActionItem
				title={ transferTitle }
				description={ transferDescription }
				decoration={ <Icon icon={ globe } size={ 24 } /> }
				actions={
					<Button
						variant="secondary"
						href={ wpcomLink( transferUrl ) }
						onClick={ handleTransferDomainClick }
						size="compact"
						__next40pxDefaultSize
					>
						{ transferButtonLabel }
					</Button>
				}
			/>
		</EmptyState.ActionList>
	);
}
