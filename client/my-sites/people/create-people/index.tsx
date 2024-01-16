import page from '@automattic/calypso-router';
import { Card } from '@automattic/components';
import { SiteDetails } from '@automattic/data-stores';
import { useTranslate } from 'i18n-calypso';
import { useState, useEffect } from 'react';
import QueryJetpackModules from 'calypso/components/data/query-jetpack-modules';
import QuerySiteInvites from 'calypso/components/data/query-site-invites';
import EmailVerificationGate from 'calypso/components/email-verification/email-verification-gate';
import EmptyContent from 'calypso/components/empty-content';
import HeaderCake from 'calypso/components/header-cake';
import Main from 'calypso/components/main';
import SectionHeader from 'calypso/components/section-header';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { userCan } from 'calypso/lib/site/utils';
import { InviteLinkForm } from 'calypso/my-sites/people/team-invite/invite-link-form';
import { useSelector } from 'calypso/state';
import { isCurrentUserEmailVerified } from 'calypso/state/current-user/selectors';
import isSiteWPForTeams from 'calypso/state/selectors/is-site-wpforteams';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import CreateForm from './create-form';
import './style.scss';

interface Props {
	site: SiteDetails;
}
function TeamInvite( props: Props ) {
	const translate = useTranslate();

	const { site } = props;
	const siteId = site.ID;
	const [ hasPermission, setHasPermission ] = useState( false );
	const isJetpack = useSelector( ( state ) => isJetpackSite( state, siteId ) );
	const needsVerification = useSelector( ( state ) => isCurrentUserEmailVerified( state ) );
	const isSiteForTeams = useSelector( ( state ) => isSiteWPForTeams( state, siteId ) );

	useEffect( checkPermission, [ site ] );

	function goBack() {
		const fallback = site?.slug ? '/people/team/' + site?.slug : '/people/team';

		page.redirect( fallback );
	}

	function checkPermission() {
		setHasPermission( !! site && userCan( 'promote_users', site ) );
	}

	if ( ! hasPermission ) {
		return (
			<Main>
				<PageViewTracker path="/people/create/:site" title="People > Create People" />
				<HeaderCake onClick={ goBack }>
					{ translate( 'Create a new team member for %(sitename)s', {
						args: { sitename: site.name ?? translate( 'this site' ) },
					} ) }
				</HeaderCake>
				<EmptyContent
					title={ translate( 'Oops, only administrators can create new people' ) }
					illustration="/calypso/images/illustrations/illustration-empty-results.svg"
				/>
			</Main>
		);
	}

	return (
		<Main>
			<PageViewTracker path="/people/create/:site" title="People > Create People" />
			{ /* { siteId && <QuerySiteInvites siteId={ siteId } /> }
			{ siteId && isJetpack && <QueryJetpackModules siteId={ siteId } /> } */ }

			<HeaderCake onClick={ goBack }>
				{ translate( 'Create a new team member for %(sitename)s', {
					args: { sitename: site.name ?? translate( 'this site' ) },
				} ) }
			</HeaderCake>

			<Card>
				<CreateForm siteId={ siteId } onInviteSuccess={ goBack } />
			</Card>
		</Main>
	);
}

export default TeamInvite;
