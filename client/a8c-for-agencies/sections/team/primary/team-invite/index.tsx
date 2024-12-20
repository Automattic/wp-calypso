import { isEnabled } from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import { Button, TextControl, TextareaControl } from '@wordpress/components';
import { addQueryArgs } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useState } from 'react';
import { A4AFeedback } from 'calypso/a8c-for-agencies/components/a4a-feedback';
import useShowFeedback from 'calypso/a8c-for-agencies/components/a4a-feedback/hooks/use-show-a4a-feedback';
import Form from 'calypso/a8c-for-agencies/components/form';
import FormField from 'calypso/a8c-for-agencies/components/form/field';
import FormSection from 'calypso/a8c-for-agencies/components/form/section';
import { LayoutWithGuidedTour as Layout } from 'calypso/a8c-for-agencies/components/layout/layout-with-guided-tour';
import LayoutTop from 'calypso/a8c-for-agencies/components/layout/layout-with-payment-notification';
import { A4A_TEAM_LINK } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import useSendTeamMemberInvite from 'calypso/a8c-for-agencies/data/team/use-send-team-member-invite';
import LayoutBody from 'calypso/layout/multi-sites-dashboard/body';
import LayoutHeader, {
	LayoutHeaderBreadcrumb as Breadcrumb,
} from 'calypso/layout/multi-sites-dashboard/header';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import { TAB_INVITED_MEMBERS } from '../../constants';

import './style.scss';

export default function TeamInvite() {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const title = translate( 'Invite a team member' );

	const [ username, setUsername ] = useState( '' );
	const [ message, setMessage ] = useState( '' );
	const [ error, setError ] = useState( '' );

	const { mutate: sendInvite, isPending: isSending } = useSendTeamMemberInvite();

	const { showFeedback, isFeedbackShown, feedbackProps } = useShowFeedback( 'member-invite-sent' );
	const isProductFeedbackEnabled = isEnabled( 'a4a-product-feedback' );

	const onSendInvite = useCallback( () => {
		setError( '' );

		if ( ! username ) {
			setError( translate( 'Please enter a valid email or WordPress.com username.' ) );
			dispatch(
				recordTracksEvent( 'calypso_a4a_team_invite_error', {
					error: 'empty_username',
				} )
			);
			return;
		}

		dispatch(
			recordTracksEvent( 'calypso_a4a_team_invite_submit', {
				has_message: !! message,
			} )
		);

		sendInvite(
			{ username, message },
			{
				onSuccess: () => {
					dispatch(
						successNotice( 'The invitation has been successfully sent.', {
							id: 'submit-user-invite-success',
							duration: 5000,
							displayOnNextPage: true,
						} )
					);
					dispatch( recordTracksEvent( 'calypso_a4a_team_invite_success' ) );
					isProductFeedbackEnabled && ! isFeedbackShown
						? window.history.replaceState(
								null,
								'',
								addQueryArgs( window.location.href, {
									args: { email: username },
								} ) + '#feedback'
						  )
						: page.redirect( `${ A4A_TEAM_LINK }/${ TAB_INVITED_MEMBERS }` );
				},

				onError: ( error ) => {
					dispatch( errorNotice( error.message ) );
					dispatch(
						recordTracksEvent( 'calypso_a4a_team_invite_error', {
							error: 'api_error',
						} )
					);
				},
			}
		);
	}, [
		dispatch,
		isProductFeedbackEnabled,
		message,
		sendInvite,
		isFeedbackShown,
		translate,
		username,
	] );

	const onUsernameChange = useCallback( ( value: string ) => {
		setError( '' );
		setUsername( value );
	}, [] );

	return (
		<Layout className="team-invite" title={ title } wide>
			<LayoutTop>
				<LayoutHeader>
					<Breadcrumb
						items={ [
							{ label: translate( 'Manage team members' ), href: A4A_TEAM_LINK },
							{ label: title },
						] }
					/>
				</LayoutHeader>
			</LayoutTop>
			<LayoutBody>
				{ isProductFeedbackEnabled && showFeedback ? (
					<A4AFeedback { ...feedbackProps } />
				) : (
					<Form
						className="team-invite-form"
						title={ translate( 'Invite a team member.' ) }
						autocomplete="off"
						description={ translate( 'Invite team members to manage client sites and purchases.' ) }
					>
						<FormSection title={ translate( 'Team member information' ) }>
							<FormField
								label={ translate( 'Email or WordPress.com Username' ) }
								error={ error }
								isRequired
							>
								<TextControl
									type="text"
									placeholder={ translate( 'team-member@example.com' ) }
									value={ username }
									onChange={ onUsernameChange }
									onClick={ () =>
										dispatch( recordTracksEvent( 'calypso_a4a_team_invite_username_click' ) )
									}
								/>
							</FormField>

							<FormField
								label={ translate( 'Message' ) }
								description={ translate(
									'Optional: Include a custom message to provide more context to your team member.'
								) }
							>
								<TextareaControl
									value={ message }
									onChange={ setMessage }
									onClick={ () =>
										dispatch( recordTracksEvent( 'calypso_a4a_team_invite_message_click' ) )
									}
								/>
							</FormField>
						</FormSection>

						<div className="team-invite-form__required-information">
							{ translate( '* Indicates a required field' ) }
						</div>

						<div className="team-invite-form__footer">
							<Button
								variant="primary"
								onClick={ onSendInvite }
								disabled={ isSending }
								isBusy={ isSending }
							>
								{ translate( 'Send invite' ) }
							</Button>
						</div>
					</Form>
				) }
			</LayoutBody>
		</Layout>
	);
}
