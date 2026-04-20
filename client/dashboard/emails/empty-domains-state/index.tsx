import { Button } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { Icon, search, globe } from '@wordpress/icons';
import { useAnalytics } from '../../app/analytics';
import EmptyState from '../../components/empty-state';
import InlineSupportLink from '../../components/inline-support-link';
import OfferCard from '../../components/offer-card';
import { wpcomLink } from '../../utils/link';

export default function EmptyDomainsState() {
	const { recordTracksEvent } = useAnalytics();

	const trackEmptyStateActionClick = ( action: string ) => {
		recordTracksEvent( 'calypso_emails_dashboard_empty_state_action_click', {
			action,
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
					<EmptyState.Title>{ __( 'You need a domain to set up email' ) }</EmptyState.Title>
					<EmptyState.Description>
						{ createInterpolateElement(
							__( 'Add a domain to create a mailbox or email forwarder. <learnMoreLink/>' ),
							{
								learnMoreLink: <InlineSupportLink supportContext="emails" />,
							}
						) }
					</EmptyState.Description>
				</EmptyState.Header>
				<EmptyState.Content>
					<EmptyState.ActionList>
						<EmptyState.ActionItem
							title={ __( 'Find a domain' ) }
							description={ __( 'Search available domains for your email address.' ) }
							decoration={ <Icon icon={ search } size={ 24 } /> }
							actions={
								<Button
									variant="secondary"
									href={ wpcomLink( '/start/domain' ) }
									onClick={ handleSearchDomainsClick }
									size="compact"
									__next40pxDefaultSize
								>
									{ __( 'Search domains' ) }
								</Button>
							}
						/>
						<EmptyState.ActionItem
							title={ __( 'Use your own domain' ) }
							description={ __( 'Transfer an existing domain to set up email here.' ) }
							decoration={ <Icon icon={ globe } size={ 24 } /> }
							actions={
								<Button
									variant="secondary"
									href={ wpcomLink( '/setup/domain-transfer' ) }
									onClick={ handleTransferDomainClick }
									size="compact"
									__next40pxDefaultSize
								>
									{ __( 'Start transfer' ) }
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
