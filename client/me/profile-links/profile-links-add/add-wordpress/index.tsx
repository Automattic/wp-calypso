import { type SiteDetails } from '@automattic/data-stores';
import { useTranslate } from 'i18n-calypso';
import React, { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import FormButton from 'calypso/components/forms/form-button';
import { onboardingUrl } from 'calypso/lib/paths';
import { recordGoogleEvent } from 'calypso/state/analytics/actions';
import getPublicSites from 'calypso/state/selectors/get-public-sites';
import getSites from 'calypso/state/selectors/get-sites';
import { type AddProfileLinkPayload, type AddProfileLinksPayload } from '../../data/types';
import { useProfileLinksQuery } from '../../data/use-profile-links-query';
import ProfileLinksAddWordPressSite from './site';

import './style.scss';

function isSite( site: SiteDetails | null | undefined ): site is SiteDetails {
	return site !== null && site !== undefined;
}

function isProfileLinkPayload(
	profileLink: AddProfileLinkPayload | null | undefined
): profileLink is AddProfileLinkPayload {
	return profileLink !== null && profileLink !== undefined;
}

const InvitationForm = ( { onCancel }: { onCancel: () => void } ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const recordClickEvent = ( action: string ) => {
		dispatch( recordGoogleEvent( 'Me', 'Clicked on ' + action ) );
	};

	return (
		<form>
			<p>
				{ translate(
					'You have no public sites on WordPress.com yet, but if you like you ' +
						'can create one now. You may also add self-hosted WordPress ' +
						'sites here after installing {{jetpackLink}}Jetpack{{/jetpackLink}} on them.',
					{
						components: {
							jetpackLink: (
								<a
									href="https://jetpack.me"
									target="_blank"
									rel="noreferrer"
									className="profile-links-add-wordpress__jetpack-link"
									onClick={ () => {
										recordClickEvent( 'Jetpack Link in Profile Links' );
										onCancel();
									} }
								/>
							),
						},
					}
				) }
			</p>
			<FormButton
				onClick={ () => {
					recordClickEvent( 'Create Sites Button in Profile Links' );
					window.open( onboardingUrl() + '?ref=me-profile-links' );
					onCancel();
				} }
			>
				{ translate( 'Create Site' ) }
			</FormButton>
			<FormButton
				className="profile-links-add-wordpress__cancel"
				isPrimary={ false }
				onClick={ onCancel }
			>
				{ translate( 'Cancel' ) }
			</FormButton>
		</form>
	);
};

type ProfileLinksAddWordpressProps = {
	addUserProfileLinks: ( links: AddProfileLinksPayload ) => void;
	isAddingProfileLinks?: boolean;
	onCancel: () => void;
};

const ProfileLinksAddWordPress = ( {
	addUserProfileLinks,
	isAddingProfileLinks = false,
	onCancel,
}: ProfileLinksAddWordpressProps ) => {
	const [ checkedSites, setCheckedSites ] = useState< number[] >( [] );

	const translate = useTranslate();
	const dispatch = useDispatch();

	const recordClickEvent = ( action: string ) =>
		dispatch( recordGoogleEvent( 'Me', 'Clicked on' + action ) );

	const { data: profileLinks = [] } = useProfileLinksQuery();

	const sites = useSelector( getSites );
	const publicSites = useSelector( getPublicSites );

	const publicSitesNotInProfileLinks = useMemo(
		() =>
			publicSites
				.filter( ( site ) => {
					return ! profileLinks.some(
						// the regex below is used to strip any leading scheme from the profileLink's URL
						( profileLink ) => profileLink.value.replace( /^.*:\/\//, '' ) === site?.domain
					);
				} )
				.filter( isSite ),
		[ profileLinks, publicSites ]
	);

	if ( ! publicSites.length ) {
		return <InvitationForm onCancel={ onCancel } />;
	}

	const toggleCheckedSite = ( siteId: number ) => {
		const newCheckedSites = checkedSites.includes( siteId )
			? checkedSites.filter( ( id ) => id !== siteId )
			: [ ...checkedSites, siteId ];

		setCheckedSites( newCheckedSites );
	};

	const handleSubmit = ( event: React.FormEvent< HTMLFormElement > ) => {
		event.preventDefault();

		if ( isAddingProfileLinks ) {
			return;
		}

		const profileLinks = checkedSites
			.map( ( siteId ) => {
				const site = sites.find( ( site ) => site?.ID === siteId );
				return site ? { title: site.name ?? '', value: site.URL } : undefined;
			} )
			.filter( isProfileLinkPayload );

		if ( profileLinks.length ) {
			addUserProfileLinks( profileLinks );
		}
	};

	return (
		<form className="profile-links-add-wordpress" onSubmit={ handleSubmit }>
			<p>{ translate( 'Please select one or more sites to add to your profile.' ) }</p>

			<ul className="profile-links-add-wordpress__list">
				{ publicSitesNotInProfileLinks.map( ( site ) => (
					<ProfileLinksAddWordPressSite
						key={ `site-${ site.ID }` }
						site={ site }
						checked={ checkedSites.includes( site.ID ) }
						onSelect={ toggleCheckedSite }
					/>
				) ) }
			</ul>

			<FormButton
				disabled={ isAddingProfileLinks || checkedSites.length === 0 }
				onClick={ () => recordClickEvent( 'Add WordPress Sites Button' ) }
				busy={ isAddingProfileLinks }
			>
				{ translate( 'Add Site', 'Add Sites', {
					context: 'bulk action',
					count: checkedSites.length,
				} ) }
			</FormButton>

			<FormButton
				className="profile-links-add-wordpress__cancel"
				isPrimary={ false }
				onClick={ () => {
					recordClickEvent( 'Cancel Add WordPress Sites Button' );
					onCancel();
				} }
			>
				{ translate( 'Cancel' ) }
			</FormButton>
		</form>
	);
};

export default ProfileLinksAddWordPress;
