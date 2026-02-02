import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { Icon, search, globe } from '@wordpress/icons';
import { addQueryArgs } from '@wordpress/url';
import { useAnalytics } from '../../app/analytics';
import EmptyState from '../../components/empty-state';
import OfferCard from '../../components/offer-card';
import { type DashboardType } from '../../utils/link';

interface EmptyDomainsStateLayoutProps {
	searchDomainNameLink: string;
	bringDomainNameTitle: string;
	bringDomainNameDescription: string;
	bringDomainNameLink: string;
	bringDomainNameCTA: string;
	dashboard: DashboardType;
}

export default function EmptyDomainsStateLayout( {
	searchDomainNameLink,
	bringDomainNameTitle,
	bringDomainNameDescription,
	bringDomainNameLink,
	bringDomainNameCTA,
	dashboard,
}: EmptyDomainsStateLayoutProps ) {
	const { recordTracksEvent } = useAnalytics();

	const trackEmptyStateActionClick = ( action: string ) => {
		recordTracksEvent( 'calypso_domains_dashboard_empty_state_action_click', {
			action,
			dashboard,
		} );
	};

	const handleSearchDomainsClick = () => {
		trackEmptyStateActionClick( 'search-domains' );
	};

	const handleTransferDomainClick = () => {
		trackEmptyStateActionClick( 'transfer-domain' );
	};

	const handleOfferClick = () => {
		trackEmptyStateActionClick( 'offer' );
	};

	return (
		<EmptyState.Wrapper>
			<EmptyState>
				<EmptyState.Header>
					<EmptyState.Title>{ __( 'Add your first domain name' ) }</EmptyState.Title>
					<EmptyState.Description>
						{ __( 'Establish a unique online identity for your site.' ) }
					</EmptyState.Description>
				</EmptyState.Header>
				<EmptyState.Content>
					<EmptyState.ActionList>
						<EmptyState.ActionItem
							title={ __( 'Search domain names' ) }
							description={ __( 'Find and register the perfect domain for your brand.' ) }
							decoration={ <Icon icon={ search } size={ 24 } /> }
							actions={
								<Button
									variant="secondary"
									href={ addQueryArgs( searchDomainNameLink, { dashboard } ) }
									onClick={ handleSearchDomainsClick }
									size="compact"
									__next40pxDefaultSize
								>
									{ __( 'Search domains' ) }
								</Button>
							}
						/>
						<EmptyState.ActionItem
							title={ bringDomainNameTitle }
							description={ bringDomainNameDescription }
							decoration={ <Icon icon={ globe } size={ 24 } /> }
							actions={
								<Button
									variant="secondary"
									href={ addQueryArgs( bringDomainNameLink, { dashboard } ) }
									onClick={ handleTransferDomainClick }
									size="compact"
									__next40pxDefaultSize
								>
									{ bringDomainNameCTA }
								</Button>
							}
						/>
					</EmptyState.ActionList>
					<OfferCard onClick={ handleOfferClick } />
				</EmptyState.Content>
			</EmptyState>
		</EmptyState.Wrapper>
	);
}
