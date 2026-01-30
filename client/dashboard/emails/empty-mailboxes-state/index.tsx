import { useNavigate } from '@tanstack/react-router';
import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { Icon, search, globe } from '@wordpress/icons';
import { useAnalytics } from '../../app/analytics';
import EmptyState from '../../components/empty-state';
import type { ReactNode } from 'react';

interface EmptyMailboxesStateProps {
	title: string;
	description: ReactNode;
	isBorderless?: boolean;
	children?: ReactNode;
}

export default function EmptyMailboxesState( {
	title,
	description,
	isBorderless = false,
	children,
}: EmptyMailboxesStateProps ) {
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

	return (
		<EmptyState.Wrapper isBorderless={ isBorderless }>
			<EmptyState>
				<EmptyState.Header>
					<EmptyState.Title>{ title }</EmptyState.Title>
					<EmptyState.Description>{ description }</EmptyState.Description>
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
					{ children }
				</EmptyState.Content>
			</EmptyState>
		</EmptyState.Wrapper>
	);
}
