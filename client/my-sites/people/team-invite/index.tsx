import { Card } from '@automattic/components';
import { SiteDetails } from '@automattic/data-stores';
import { useTranslate } from 'i18n-calypso';
import page from 'page';
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import QueryJetpackModules from 'calypso/components/data/query-jetpack-modules';
import QuerySiteInvites from 'calypso/components/data/query-site-invites';
import EmailVerificationGate from 'calypso/components/email-verification/email-verification-gate';
import EmptyContent from 'calypso/components/empty-content';
import HeaderCake from 'calypso/components/header-cake';
import Main from 'calypso/components/main';
import SectionHeader from 'calypso/components/section-header';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { userCan } from 'calypso/lib/site/utils';
import P2TeamBanner from 'calypso/my-sites/people/p2-team-banner';
import { InviteLinkForm } from 'calypso/my-sites/people/team-invite/invite-link-form';
import { isCurrentUserEmailVerified } from 'calypso/state/current-user/selectors';
import isSiteWPForTeams from 'calypso/state/selectors/is-site-wpforteams';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { useSsoNotice } from './hooks/use-sso-notice';
import InviteForm from './invite-form';
import SsoNotice from './sso-notice';
import './style.scss';

interface Props {
	site: SiteDetails;
}
function TeamInvite( props: Props ) {
	const _ = useTranslate();

	const { site } = props;
	const siteId = site.ID;
	const [ hasPermission, setHasPermission ] = useState( false );
	const isJetpack = useSelector( ( state ) => isJetpackSite( state, siteId ) );
	const needsVerification = useSelector( ( state ) => isCurrentUserEmailVerified( state ) );
	const isSiteForTeams = useSelector( ( state ) => isSiteWPForTeams( state, siteId ) );
	const showSSONotice = useSsoNotice( siteId );

	useEffect( checkPermission, [ site ] );

	function goBack() {
		const fallback = site?.slug ? '/people/team-members/' + site?.slug : '/people/team-members';

		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore: There are no type definitions for page.back.
		page.back( fallback );
	}

	function checkPermission() {
		setHasPermission( !! site && userCan( 'promote_users', site ) );
	}

	if ( ! hasPermission ) {
		return (
			<Main>
				<PageViewTracker path="/people/new/:site" title="People > Invite People" />
				<HeaderCake isCompact onClick={ goBack }>
					{ _( 'Add team members' ) }
				</HeaderCake>
				<EmptyContent
					title={ _( 'Oops, only administrators can invite other people' ) }
					illustration="/calypso/images/illustrations/illustration-empty-results.svg"
				/>
			</Main>
		);
	}

	return (
		<Main>
			<PageViewTracker path="/people/new/:site" title="People > Invite People" />
			{ siteId && <QuerySiteInvites siteId={ siteId } /> }
			{ siteId && isJetpack && <QueryJetpackModules siteId={ siteId } /> }

			<HeaderCake isCompact onClick={ goBack }>
				{ _( 'Add team members' ) }
			</HeaderCake>

			{ isSiteForTeams && <P2TeamBanner context="invite" site={ site } /> }

			{ ( () => {
				if ( ! site || ! isJetpack || needsVerification ) {
					return (
						<Card>
							<EmailVerificationGate>
								<InviteForm />
							</EmailVerificationGate>
						</Card>
					);
				} else if ( showSSONotice ) {
					return (
						<SsoNotice siteId={ siteId }>
							<Card>
								<InviteForm />
							</Card>
						</SsoNotice>
					);
				}
			} )() }

			{ isSiteForTeams && (
				<>
					<SectionHeader label={ _( 'Invite Link' ) } />
					<Card className="invite-people__link">
						<EmailVerificationGate>
							<InviteLinkForm siteId={ siteId } />
						</EmailVerificationGate>
					</Card>
				</>
			) }
		</Main>
	);
}

export default TeamInvite;
