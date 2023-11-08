import { Card } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { times } from 'lodash';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import SectionHeader from 'calypso/components/section-header';
import ProfileLink from 'calypso/me/profile-link';
import AddProfileLinksButtons from 'calypso/me/profile-links/add-buttons';
import ProfileLinksAddOther from 'calypso/me/profile-links-add-other';
import ProfileLinksAddWordPress from 'calypso/me/profile-links-add-wordpress';
import { errorNotice } from 'calypso/state/notices/actions';
import { useAddProfileLinkMutation } from './data/use-add-profile-link-mutation';
import { useProfileLinksQuery } from './data/use-profile-links-query';
import type * as types from './data/types';

import './style.scss';

function EmptyProfileLinks() {
	const translate = useTranslate();

	return (
		<p className="profile-links__no-links">
			{ translate( "You have no sites in your profile links. You may add sites if you'd like." ) }
		</p>
	);
}

function Placeholders() {
	return (
		<ul className="profile-links__list">
			{ times( 2, ( index ) => (
				<ProfileLink
					title="Loading Profile Links"
					url="https://wordpress.com/"
					slug="A placeholder profile link"
					isPlaceholder
					key={ index }
				/>
			) ) }
		</ul>
	);
}

function ProfileLinksList( { profileLinks }: { profileLinks?: types.ProfileLink[] } ) {
	const translate = useTranslate();
	const initialized = Array.isArray( profileLinks );
	const countLinks = initialized ? profileLinks.length : 0;

	if ( ! initialized ) {
		return <Placeholders />;
	}

	return (
		<div>
			<p>{ translate( 'Manage which sites appear in your profile.' ) }</p>

			{ countLinks > 0 ? (
				<ul className="profile-links__list">
					{ profileLinks.map( ( profileLink ) => (
						<ProfileLink
							key={ profileLink.link_slug }
							title={ profileLink.title }
							url={ profileLink.value }
							slug={ profileLink.link_slug }
						/>
					) ) }
				</ul>
			) : (
				<EmptyProfileLinks />
			) }
		</div>
	);
}

type ShowingForm = 'wordpress' | 'other' | null;

function ProfileLinks() {
	const dispatch = useDispatch();
	const translate = useTranslate();
	const [ showingForm, setShowingForm ] = useState< ShowingForm >( null );
	const [ showPopoverMenu, setShowPopoverMenu ] = useState( false );
	const { data: profileLinks } = useProfileLinksQuery();

	const generalError = translate( 'An unexpected error occurred. Please try again later.' );
	const duplicateError = translate(
		'That link is already in your profile links. No changes were made.'
	);

	const { addProfileLinks } = useAddProfileLinkMutation( {
		onSuccess: ( data ) => {
			if ( data.duplicate ) {
				dispatch( errorNotice( duplicateError ) );
				return;
			}
			if ( data.malformed ) {
				dispatch( errorNotice( generalError ) );
			}
		},
		onError: () => {
			dispatch( errorNotice( generalError ) );
		},
	} );

	const hideForms = () => setShowingForm( null );

	function renderForm() {
		if ( 'wordpress' === showingForm ) {
			return (
				<ProfileLinksAddWordPress
					onSuccess={ hideForms }
					onCancel={ hideForms }
					addUserProfileLinks={ addProfileLinks }
				/>
			);
		}

		return (
			<ProfileLinksAddOther
				onSuccess={ hideForms }
				onCancel={ hideForms }
				addUserProfileLinks={ addProfileLinks }
			/>
		);
	}

	return (
		<>
			<SectionHeader label={ translate( 'Profile links' ) }>
				<AddProfileLinksButtons
					disabled={ !! showingForm }
					onShowAddOther={ () => setShowingForm( 'other' ) }
					onShowAddWordPress={ () => setShowingForm( 'wordpress' ) }
					showPopoverMenu={ showPopoverMenu }
					onShowPopoverMenu={ () => setShowPopoverMenu( true ) }
					onClosePopoverMenu={ () => setShowPopoverMenu( false ) }
				/>
			</SectionHeader>
			<Card>
				{ showingForm ? renderForm() : <ProfileLinksList profileLinks={ profileLinks } /> }
			</Card>
		</>
	);
}

export default ProfileLinks;
