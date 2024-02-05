import { Card } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { times } from 'lodash';
import { useState } from 'react';
import SectionHeader from 'calypso/components/section-header';
import AddProfileLinksButtons from 'calypso/me/profile-links/add-buttons';
import { useProfileLinksQuery } from './data/use-profile-links-query';
import ProfileLink from './profile-link';
import ProfileLinksAdd, { type ShowingForm } from './profile-links-add';
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

function ProfileLinks() {
	const translate = useTranslate();
	const [ showingForm, setShowingForm ] = useState< ShowingForm | null >( null );
	const [ showPopoverMenu, setShowPopoverMenu ] = useState( false );
	const { data: profileLinks } = useProfileLinksQuery();

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
				{ showingForm ? (
					<ProfileLinksAdd
						showingForm={ showingForm }
						onSuccess={ () => setShowingForm( null ) }
						onCancel={ () => setShowingForm( null ) }
					/>
				) : (
					<ProfileLinksList profileLinks={ profileLinks } />
				) }
			</Card>
		</>
	);
}

export default ProfileLinks;
