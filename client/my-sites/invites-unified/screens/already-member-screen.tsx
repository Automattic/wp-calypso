import { Step } from '@automattic/onboarding';
import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { UserCard, type UserCardUser } from 'calypso/components/connect-screen/user-card';
import DocumentHead from 'calypso/components/data/document-head';
import BodySectionCssClass from 'calypso/layout/body-section-css-class';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { navigate } from 'calypso/lib/navigate';
import { getCiabConfigFromGarden } from 'calypso/lib/partner-branding';
import { login } from 'calypso/lib/paths';
import { useDispatch } from 'calypso/state';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import { hideMasterbar } from 'calypso/state/ui/actions';
import type { InviteBlogDetails } from '../types';

import './style.scss';

interface AlreadyMemberScreenProps {
	blogDetails?: InviteBlogDetails;
}

export function AlreadyMemberScreen( { blogDetails }: AlreadyMemberScreenProps ) {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const user = useSelector( getCurrentUser );

	const gardenName = blogDetails?.garden?.name || null;
	const gardenPartner = blogDetails?.garden?.partner || null;

	const trackingProps = useMemo(
		() => ( {
			garden_name: gardenName,
			garden_partner: gardenPartner,
			unified: true,
		} ),
		[ gardenName, gardenPartner ]
	);

	useEffect( () => {
		dispatch( hideMasterbar() );
		recordTracksEvent( 'calypso_invite_already_member_load_page', {
			...trackingProps,
			logged_in: true,
		} );
	}, [] ); // eslint-disable-line react-hooks/exhaustive-deps

	const handleSwitchAccount = useCallback( () => {
		recordTracksEvent( 'calypso_invite_already_member_switch_account_click', trackingProps );
		navigate( login( { redirectTo: window.location.href } ) );
	}, [ trackingProps ] );

	const userCardData: UserCardUser = {
		displayName: user?.display_name || '',
		email: user?.email || '',
		avatarUrl: user?.avatar_URL,
	};

	const branding = blogDetails?.garden
		? getCiabConfigFromGarden( blogDetails.garden.partner, blogDetails.garden.name, {
				persistToSession: true,
		  } )
		: null;

	const topBarLogoConfig = branding?.compactLogo ?? branding?.logo;
	const topBarLogo = topBarLogoConfig?.src ? (
		<img
			src={ topBarLogoConfig.src }
			alt={ topBarLogoConfig.alt }
			width={ topBarLogoConfig.width }
			height={ topBarLogoConfig.height }
		/>
	) : undefined;

	const title = translate( 'You are already a member of this site' );
	const description = translate( 'Would you like to accept the invite with a different account?' );

	const heading = <Step.Heading text={ title } subText={ description } />;
	const topBar = <Step.TopBar logo={ topBarLogo } />;

	return (
		<>
			<DocumentHead title={ translate( 'Accept Invite', { textOnly: true } ) } />
			<BodySectionCssClass
				bodyClass={ [
					'is-section-accept-invite-unified',
					...( branding?.fontStyle === 'system' ? [ 'is-ciab-font-system' ] : [] ),
				] }
			/>
			<Step.CenteredColumnLayout
				columnWidth={ 4 }
				heading={ heading }
				verticalAlign="center"
				topBar={ topBar }
			>
				<UserCard user={ userCardData } size="large" />
				<div className="already-member-screen-switch-account">
					<Button variant="link" onClick={ handleSwitchAccount }>
						{ translate( 'Log in with a different account' ) }
					</Button>
				</div>
			</Step.CenteredColumnLayout>
		</>
	);
}

export default AlreadyMemberScreen;
