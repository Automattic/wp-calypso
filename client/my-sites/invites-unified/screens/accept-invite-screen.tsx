import page from '@automattic/calypso-router';
import { localizeUrl } from '@automattic/i18n-utils';
import { Step } from '@automattic/onboarding';
import { useTranslate } from 'i18n-calypso';
import { useState, useCallback, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { ActionButtons } from 'calypso/components/connect-screen/action-buttons';
import { ConsentText } from 'calypso/components/connect-screen/consent-text';
import { UserCard, type UserCardUser } from 'calypso/components/connect-screen/user-card';
import DocumentHead from 'calypso/components/data/document-head';
import BodySectionCssClass from 'calypso/layout/body-section-css-class';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { navigate } from 'calypso/lib/navigate';
import { getCiabConfigFromGarden, type CiabPartnerConfig } from 'calypso/lib/partner-branding';
import { login } from 'calypso/lib/paths';
import { getRedirectAfterAccept } from 'calypso/my-sites/invites/utils';
import { useDispatch } from 'calypso/state';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import { hasDashboardOptIn } from 'calypso/state/dashboard/selectors/has-dashboard-opt-in';
import { acceptInvite } from 'calypso/state/invites/actions';
import { infoNotice, errorNotice } from 'calypso/state/notices/actions';
import { hideMasterbar } from 'calypso/state/ui/actions';
import EmailMismatchScreen from './email-mismatch-screen';
import type { Invite, InviteBlogDetails } from '../types';

import './style.scss';

/**
 * Transform invite data to the format expected by acceptInvite action and getRedirectAfterAccept
 */
function toLegacyInvite( invite: Invite ) {
	const blogDetails = invite.blog_details;
	return {
		inviteKey: invite.inviteKey,
		activationKey: invite.activationKey,
		site: {
			URL: blogDetails?.URL || '',
			title: blogDetails?.title || '',
			is_wpforteams_site: false,
			ID: invite.invite?.blog_id || '',
			domain: blogDetails?.domain || '',
			admin_url: blogDetails?.admin_url || '',
			is_vip: blogDetails?.is_vip || false,
		},
		role: invite.invite?.meta?.role || '',
		sentTo: invite.invite?.meta?.sent_to || '',
	};
}

/**
 * Get CIAB branding config from blog details
 */
function getBrandingFromBlogDetails( blogDetails?: InviteBlogDetails ): CiabPartnerConfig | null {
	if ( ! blogDetails?.is_garden_site || ! blogDetails?.garden ) {
		return null;
	}

	return getCiabConfigFromGarden( blogDetails.garden.partner, blogDetails.garden.name );
}

interface AcceptInviteScreenProps {
	invite: Invite;
}

/**
 * Get the button labels for accepting an invite based on role
 */
function getAcceptButtonLabels(
	role: string,
	translate: ReturnType< typeof useTranslate >
): { accepting: React.ReactNode; accept: React.ReactNode } {
	switch ( role ) {
		case 'follower':
			return {
				accepting: translate( 'Following…', { context: 'button' } ),
				accept: translate( 'Follow', { context: 'button' } ),
			};
		default:
			return {
				accepting: translate( 'Joining…', { context: 'button' } ),
				accept: translate( 'Join', { context: 'button' } ),
			};
	}
}

/**
 * Get the description text for a role invitation
 */
function getRoleDescription(
	role: string,
	siteDomain: string,
	translate: ReturnType< typeof useTranslate >
) {
	switch ( role ) {
		case 'administrator':
			return translate(
				'As an administrator on %(siteDomain)s, you will be able to manage all aspects of the store.',
				{ args: { siteDomain } }
			);
		case 'editor':
			return translate(
				'As an editor on %(siteDomain)s, you will be able to publish and manage posts and products.',
				{ args: { siteDomain } }
			);
		case 'author':
			return translate(
				'As an author on %(siteDomain)s, you will be able to publish and edit your own posts.',
				{ args: { siteDomain } }
			);
		case 'shop_manager':
			return translate(
				'As a store manager on %(siteDomain)s, you will be able to handle the daily operations of the store.',
				{ args: { siteDomain } }
			);
		case 'contributor':
			return translate(
				'As a contributor on %(siteDomain)s, you will be able to write and manage your own posts.',
				{ args: { siteDomain } }
			);
		case 'subscriber':
			return translate(
				'As a subscriber on %(siteDomain)s, you will be able to manage your profile.',
				{ args: { siteDomain } }
			);
		case 'viewer':
			return translate(
				'As a viewer on %(siteDomain)s, you will be able to view the private site.',
				{ args: { siteDomain } }
			);
		case 'follower':
			return translate(
				'As a follower of %(siteDomain)s, you can read the latest posts in the WordPress.com Reader.',
				{ args: { siteDomain } }
			);
		default:
			return translate( 'You have been invited to join %(siteDomain)s.', {
				args: { siteDomain },
			} );
	}
}

export function AcceptInviteScreen( { invite }: AcceptInviteScreenProps ) {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const [ isSubmitting, setIsSubmitting ] = useState( false );

	const user = useSelector( getCurrentUser );
	const dashboardOptIn = useSelector( hasDashboardOptIn );
	const emailVerificationSecret =
		new URLSearchParams( window.location.search ).get( 'email_verification_secret' ) || undefined;

	const storeName = invite?.blog_details?.title || invite?.blog_details?.domain || '';
	const siteDomain = invite?.blog_details?.domain || '';
	const roleName = invite?.invite?.meta?.role || 'contributor';
	const inviteSentTo = invite?.invite?.meta?.sent_to || '';
	const isKnownUser = invite?.invite?.meta?.known ?? false;

	// Check if the invite requires a specific email that doesn't match the current user
	const forceMatchingEmail =
		invite?.invite?.meta?.force_matching_email && user?.email !== inviteSentTo;

	// Get branding from blog_details garden info
	const branding = getBrandingFromBlogDetails( invite?.blog_details );
	const gardenName = invite?.blog_details?.garden?.name || null;
	const gardenPartner = invite?.blog_details?.garden?.partner || null;

	const userCardData: UserCardUser = {
		displayName: user?.display_name || '',
		email: user?.email || '',
		avatarUrl: user?.avatar_URL,
	};

	const trackingProps = {
		role: roleName,
		garden_name: gardenName,
		garden_partner: gardenPartner,
		unified: true,
	};

	useEffect( () => {
		dispatch( hideMasterbar() );
		recordTracksEvent( 'calypso_invite_accept_load_page', {
			...trackingProps,
			logged_in: true,
		} );
	}, [] ); // eslint-disable-line react-hooks/exhaustive-deps

	const handleAccept = useCallback( async () => {
		setIsSubmitting( true );
		recordTracksEvent( 'calypso_invite_accept_logged_in_join_button_click', trackingProps );

		try {
			const legacyInvite = toLegacyInvite( invite );
			await dispatch( acceptInvite( legacyInvite, emailVerificationSecret ) );
			const redirectUrl = getRedirectAfterAccept( legacyInvite, dashboardOptIn );
			navigate( redirectUrl );
		} catch ( error ) {
			setIsSubmitting( false );
			const errorMessage = error instanceof Error ? error.message : undefined;
			dispatch(
				errorNotice( errorMessage || translate( 'There was a problem accepting the invitation.' ) )
			);
		}
	}, [ dispatch, invite, emailVerificationSecret, dashboardOptIn, trackingProps, translate ] );

	const handleDecline = useCallback( () => {
		recordTracksEvent( 'calypso_invite_accept_logged_in_decline_button_click', trackingProps );
		dispatch( infoNotice( translate( 'You declined to join.' ), { displayOnNextPage: true } ) );
		page( '/' );
	}, [ dispatch, trackingProps, translate ] );

	const getLoginUrl = useCallback( () => {
		let loginUrl = login( { redirectTo: window.location.href } );
		if ( inviteSentTo ) {
			loginUrl += '&email_address=' + encodeURIComponent( inviteSentTo );
		}
		return loginUrl;
	}, [ inviteSentTo ] );

	const handleSwitchAccount = useCallback( () => {
		recordTracksEvent( 'calypso_invite_accept_logged_in_sign_in_link_click', trackingProps );
		navigate( getLoginUrl() );
	}, [ trackingProps, getLoginUrl ] );

	const title = translate( 'Start managing %(storeName)s', {
		args: { storeName },
	} );

	const description = getRoleDescription( roleName, siteDomain, translate );

	// Build logo element for TopBar
	const topBarLogo = branding?.logo?.src ? (
		<img
			src={ branding.logo.src }
			alt={ branding.logo.alt }
			width={ branding.logo.width }
			height={ branding.logo.height }
		/>
	) : undefined;

	const heading = <Step.Heading text={ title } subText={ description } />;

	const topBar = <Step.TopBar logo={ topBarLogo } />;

	// Show error state when invite requires a specific email that doesn't match
	if ( forceMatchingEmail ) {
		return (
			<EmailMismatchScreen
				inviteSentTo={ inviteSentTo }
				isKnownUser={ isKnownUser }
				topBarLogo={ topBarLogo }
				trackingProps={ trackingProps }
			/>
		);
	}

	return (
		<>
			<DocumentHead title={ translate( 'Accept Invite', { textOnly: true } ) } />
			<BodySectionCssClass bodyClass={ [ 'is-section-accept-invite-unified' ] } />
			<Step.CenteredColumnLayout
				columnWidth={ 4 }
				heading={ heading }
				verticalAlign="center"
				topBar={ topBar }
			>
				<UserCard user={ userCardData } size="large" />
				<div className="accept-invite-consent-wrapper">
					<ConsentText>
						{ translate(
							"By clicking join, you agree to our {{tosLink}}Terms of Service{{/tosLink}} and to {{syncLink}}sync your site's data{{/syncLink}} with WordPress.com.",
							{
								components: {
									tosLink: (
										<a
											href={ localizeUrl( 'https://wordpress.com/tos/' ) }
											target="_blank"
											rel="noreferrer"
										/>
									),
									syncLink: (
										<a
											href={ localizeUrl(
												'https://jetpack.com/support/what-data-does-jetpack-sync/'
											) }
											target="_blank"
											rel="noreferrer"
										/>
									),
								},
							}
						) }
					</ConsentText>
				</div>
				<ActionButtons
					primaryLabel={
						isSubmitting
							? getAcceptButtonLabels( roleName, translate ).accepting
							: getAcceptButtonLabels( roleName, translate ).accept
					}
					primaryOnClick={ handleAccept }
					primaryLoading={ isSubmitting }
					secondaryLabel={ translate( 'Cancel', { context: 'button' } ) }
					secondaryOnClick={ handleDecline }
					tertiaryLabel={ translate( 'Log in with another account' ) }
					tertiaryOnClick={ handleSwitchAccount }
				/>
			</Step.CenteredColumnLayout>
		</>
	);
}

export default AcceptInviteScreen;
