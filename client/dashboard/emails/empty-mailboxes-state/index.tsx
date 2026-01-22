import { useNavigate } from '@tanstack/react-router';
import { Button } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { Icon, search, globe } from '@wordpress/icons';
import { useAnalytics } from '../../app/analytics';
import EmptyState from '../../components/empty-state';
import InlineSupportLink from '../../components/inline-support-link';
import OfferCard from '../../components/offer-card';

export default function EmptyMailboxesState() {
	const { recordTracksEvent } = useAnalytics();
	const navigate = useNavigate();

	const trackEmptyStateActionClick = ( action: string ) => {
		recordTracksEvent( 'calypso_emails_dashboard_empty_mailboxes_state_action_click', {
			action,
		} );
	};

	const handleAddMailboxClick = () => {
		trackEmptyStateActionClick( 'add-mailbox' );
		navigate( { to: '/emails/choose-domain' } );
	};

	const handleAddForwarderClick = () => {
		trackEmptyStateActionClick( 'add-forwarder' );
		navigate( { to: '/emails/add-forwarder' } );
	};

	const handleOfferClick = () => {
		trackEmptyStateActionClick( 'offer' );
	};

	return (
		<EmptyState.Wrapper>
			<EmptyState>
				<EmptyState.Header>
					<EmptyState.Title>{ __( 'Set up email for your domain' ) }</EmptyState.Title>
					<EmptyState.Description>
						{ createInterpolateElement(
							__(
								'Create a mailbox or set up a forwarder for an email address using your domain. <learnMoreLink/>'
							),
							{
								learnMoreLink: <InlineSupportLink supportContext="emails" />,
							}
						) }
					</EmptyState.Description>
				</EmptyState.Header>
				<EmptyState.Content>
					<EmptyState.ActionList>
						<EmptyState.ActionItem
							title={ __( 'Add mailbox' ) }
							description={ __(
								'Get a full inbox for sending and receiving mail with your domain.'
							) }
							decoration={ <Icon icon={ search } size={ 24 } fill="#1E1E1E" /> }
							actions={
								<Button
									variant="primary"
									onClick={ handleAddMailboxClick }
									size="compact"
									__next40pxDefaultSize
								>
									{ __( 'Add mailbox' ) }
								</Button>
							}
						/>
						<EmptyState.ActionItem
							title={ __( 'Add email forwarder' ) }
							description={ __(
								'Forward emails sent to your domain address to another inbox you use.'
							) }
							decoration={ <Icon icon={ globe } size={ 24 } fill="#1E1E1E" /> }
							actions={
								<Button
									variant="secondary"
									onClick={ handleAddForwarderClick }
									size="compact"
									__next40pxDefaultSize
								>
									{ __( 'Set up a forwarder' ) }
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
