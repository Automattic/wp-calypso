import page from '@automattic/calypso-router';
import { Button, TextControl, TextareaControl } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useState } from 'react';
import Form from 'calypso/a8c-for-agencies/components/form';
import FormField from 'calypso/a8c-for-agencies/components/form/field';
import FormSection from 'calypso/a8c-for-agencies/components/form/section';
import Layout from 'calypso/a8c-for-agencies/components/layout';
import LayoutBody from 'calypso/a8c-for-agencies/components/layout/body';
import LayoutHeader, {
	LayoutHeaderBreadcrumb as Breadcrumb,
} from 'calypso/a8c-for-agencies/components/layout/header';
import LayoutTop from 'calypso/a8c-for-agencies/components/layout/top';
import { A4A_TEAM_LINK } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import useSendTeamMemberInvite from 'calypso/a8c-for-agencies/data/team/use-send-team-member-invite';
import { useDispatch } from 'calypso/state';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';

import './style.scss';

export default function TeamInvite() {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const title = translate( 'Invite a team member' );

	const [ username, setUsername ] = useState( '' );
	const [ message, setMessage ] = useState( '' );
	const [ error, setError ] = useState( '' );

	const { mutate: sendInvite, isPending: isSending } = useSendTeamMemberInvite();

	const onSendInvite = useCallback( () => {
		setError( '' );

		if ( ! username ) {
			setError( translate( 'Please enter a valid email or WordPress.com username.' ) );
			return;
		}

		sendInvite(
			{ username, message },
			{
				onSuccess: () => {
					dispatch( successNotice( 'The invitation has been successfully sent.' ) );
					page( A4A_TEAM_LINK );
				},

				onError: ( error ) => {
					dispatch( errorNotice( error.message ) );
				},
			}
		);
	}, [ dispatch, message, sendInvite, translate, username ] );

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
				<Form
					className="team-invite-form"
					title={ translate( 'Invite a team member.' ) }
					autocomplete="off"
					description={ translate( 'Invite team members to manage client sites and purchases' ) }
				>
					<FormSection title={ translate( 'Team member information' ) }>
						<FormField
							label={ translate( 'Email or WordPress.com Username' ) }
							error={ error }
							isRequired
						>
							<TextControl
								type="text"
								placeholder={ translate( 'team-member@example.com' ) }
								value={ username }
								onChange={ onUsernameChange }
							/>
						</FormField>

						<FormField
							label={ translate( 'Message' ) }
							description={ translate(
								'Optional: Include a custom message to provide more context to your team member.'
							) }
						>
							<TextareaControl value={ message } onChange={ setMessage } />
						</FormField>
					</FormSection>

					<div className="team-invite-form__required-information">
						{ translate( '* Indicates a required field' ) }
					</div>

					<div className="team-invite-form__footer">
						<Button variant="primary" onClick={ onSendInvite } disabled={ isSending }>
							{ translate( 'Send invite' ) }
						</Button>
					</div>
				</Form>
			</LayoutBody>
		</Layout>
	);
}
