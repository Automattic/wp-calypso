import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useState, useEffect, ChangeEvent, useRef } from 'react';
import ClipboardButton from 'calypso/components/forms/clipboard-button';
import FormTextInput from 'calypso/components/forms/form-text-input';
import accept from 'calypso/lib/accept';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { generateInviteLinks, disableInviteLinks } from 'calypso/state/invites/actions';
import { getInviteLinksForSite } from 'calypso/state/invites/selectors';
import RoleSelect from '../role-select';
import { InviteLink, InviteLinks } from './types';

interface Props {
	siteId: number;
}
export function InviteLinkForm( props: Props ) {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const { siteId } = props;

	const [ role, setRole ] = useState( 'administrator' );
	const [ isGeneratingInviteLinks, setIsGeneratingInviteLinks ] = useState( false );
	const [ showCopyConfirmation, setShowCopyConfirmation ] = useState( false );
	const [ activeInviteLink, setActiveInviteLink ] = useState< InviteLink >();
	const inviteLinks = useSelector( ( state ) =>
		getInviteLinksForSite( state, siteId )
	) as InviteLinks | null;

	const copyConfirmTimeoutId = useRef< NodeJS.Timeout >();

	useEffect( resetActiveLinkValue, [ inviteLinks, role ] );
	useEffect( toggleIsGeneratingInviteLinks, [ activeInviteLink ] );

	function resetActiveLinkValue() {
		if ( inviteLinks && inviteLinks[ role ] ) {
			setActiveInviteLink( inviteLinks[ role ] );
		} else {
			setActiveInviteLink( undefined );
		}
	}

	function toggleIsGeneratingInviteLinks() {
		setIsGeneratingInviteLinks( !! activeInviteLink );
	}

	function generateLinks() {
		setIsGeneratingInviteLinks( true );
		if ( ! isGeneratingInviteLinks ) {
			dispatch( generateInviteLinks( siteId ) );
			dispatch( recordTracksEvent( 'calypso_invite_people_generate_new_link_button_click' ) );
		}
	}

	function disableLinks() {
		accept(
			<div>
				<p>
					{ translate(
						'Once this invite link is disabled, nobody will be able to use it to join your team. Are you sure?'
					) }
				</p>
			</div>,
			( accepted: boolean ) => {
				if ( accepted ) {
					dispatch( disableInviteLinks( siteId ) );
				}
			},
			translate( 'Disable' )
		);
	}

	function onInviteLinkCopy() {
		setShowCopyConfirmation( true );

		clearTimeout( copyConfirmTimeoutId.current as NodeJS.Timeout );
		copyConfirmTimeoutId.current = setTimeout( () => {
			setShowCopyConfirmation( false );
		}, 4000 );
	}

	return (
		<>
			<div className="invite-people__link-instructions">
				{ translate(
					'Use this link to onboard your team members without having to invite them one by one. ' +
						'{{strong}}Anybody visiting this URL will be able to sign up to your organization,{{/strong}} ' +
						'even if they received the link from somebody else, so make sure that you share it with trusted people.',
					{ components: { strong: <strong /> } }
				) }
			</div>

			{ ! activeInviteLink && (
				<Button
					onClick={ generateLinks }
					className="invite-people__link-generate"
					busy={ isGeneratingInviteLinks }
				>
					{ translate( 'Generate new link' ) }
				</Button>
			) }

			{ activeInviteLink && (
				<>
					<div className="invite-people__link-selector">
						<RoleSelect
							id="role"
							name="role"
							siteId={ siteId }
							value={ role }
							disabled={ false }
							explanation={ false }
							showLabel={ false }
							includeFollower
							includeSubscriber={ false }
							formControlType="select"
							onChange={ ( e: ChangeEvent< HTMLSelectElement > ) => setRole( e.target.value ) }
						/>

						<FormTextInput
							id="invite-people__link-selector-text"
							className="invite-people__link-selector-text"
							value={ activeInviteLink.link }
							readOnly
						/>

						<ClipboardButton
							className="invite-people__link-selector-copy"
							compact
							text={ activeInviteLink.link }
							onCopy={ onInviteLinkCopy }
						>
							{ showCopyConfirmation && translate( 'Copied!' ) }
							{ ! showCopyConfirmation && translate( 'Copy link' ) }
						</ClipboardButton>
					</div>

					<div className="invite-people__link-footer">
						<span className="invite-people__link-expiry">
							Expires on { new Date( activeInviteLink.expiry * 1000 ).toLocaleDateString() }{ ' ' }
						</span>
						<span>
							(
							<button className="invite-people__link-disable" onClick={ disableLinks }>
								{ translate( 'Disable invite link' ) }
							</button>
							)
						</span>
					</div>
				</>
			) }
		</>
	);
}
