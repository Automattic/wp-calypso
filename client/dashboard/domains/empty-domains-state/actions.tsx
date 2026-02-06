import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { Icon, search, globe } from '@wordpress/icons';
import { useAnalytics } from '../../app/analytics';
import { useAppContext } from '../../app/context';
import EmptyState from '../../components/empty-state';
import { wpcomLink } from '../../utils/link';

function SearchDomainsActionItem( { url }: { url: string } ) {
	const { recordTracksEvent } = useAnalytics();

	return (
		<EmptyState.ActionItem
			title={ __( 'Search domain names' ) }
			description={ __( 'Find and register the perfect domain for your brand.' ) }
			decoration={ <Icon icon={ search } size={ 24 } /> }
			actions={
				<Button
					variant="secondary"
					href={ wpcomLink( url ) }
					onClick={ () =>
						recordTracksEvent( 'calypso_domains_dashboard_empty_state_action_click', {
							action: 'search-domains',
						} )
					}
					size="compact"
					__next40pxDefaultSize
				>
					{ __( 'Search domains' ) }
				</Button>
			}
		/>
	);
}

function TransferDomainActionItem() {
	const { recordTracksEvent } = useAnalytics();

	return (
		<EmptyState.ActionItem
			title={ __( 'Transfer a domain you already own' ) }
			description={ __( 'Move your domain to WordPress.com and manage everything in one place.' ) }
			decoration={ <Icon icon={ globe } size={ 24 } /> }
			actions={
				<Button
					variant="secondary"
					href={ wpcomLink( '/setup/domain-transfer' ) }
					onClick={ () =>
						recordTracksEvent( 'calypso_domains_dashboard_empty_state_action_click', {
							action: 'transfer-domain',
						} )
					}
					size="compact"
					__next40pxDefaultSize
				>
					{ __( 'Start transfer' ) }
				</Button>
			}
		/>
	);
}

function ConnectDomainActionItem() {
	const { recordTracksEvent } = useAnalytics();

	return (
		<EmptyState.ActionItem
			title={ __( 'Use a domain name you already own' ) }
			description={ __( 'Bring your domain to WordPress.com and manage everything in one place.' ) }
			decoration={ <Icon icon={ globe } size={ 24 } /> }
			actions={
				<Button
					variant="secondary"
					href={ wpcomLink( '/setup/domain/use-my-domain' ) }
					onClick={ () =>
						recordTracksEvent( 'calypso_domains_dashboard_empty_state_action_click', {
							action: 'transfer-domain',
						} )
					}
					size="compact"
					__next40pxDefaultSize
				>
					{ __( 'Use a domain name I own' ) }
				</Button>
			}
		/>
	);
}

function DomainOnlyEmptyDomainsStateActions() {
	return (
		<EmptyState.ActionList>
			<SearchDomainsActionItem url="/start/domain" />
			<TransferDomainActionItem />
		</EmptyState.ActionList>
	);
}

function DefaultEmptyDomainsStateActions() {
	return (
		<EmptyState.ActionList>
			<SearchDomainsActionItem url="/setup/domain" />
			<ConnectDomainActionItem />
		</EmptyState.ActionList>
	);
}

export default function EmptyDomainsStateActions() {
	const { supports } = useAppContext();

	if ( supports.domainOnlySites ) {
		return <DomainOnlyEmptyDomainsStateActions />;
	}

	return <DefaultEmptyDomainsStateActions />;
}
