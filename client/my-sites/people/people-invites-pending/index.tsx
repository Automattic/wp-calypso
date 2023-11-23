import page from '@automattic/calypso-router';
import { SiteDetails } from '@automattic/data-stores';
import { localizeUrl } from '@automattic/i18n-utils';
import { useTranslate } from 'i18n-calypso';
import EmptyContent from 'calypso/components/empty-content';
import HeaderCake from 'calypso/components/header-cake';
import InlineSupportLink from 'calypso/components/inline-support-link';
import Main from 'calypso/components/main';
import NavigationHeader from 'calypso/components/navigation-header';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import TeamInvites from 'calypso/my-sites/people/team-invites';
import { useSelector } from 'calypso/state';
import { getPendingInvitesForSite } from 'calypso/state/invites/selectors';

interface Props {
	site: SiteDetails;
}

export default function PeopleInvitesPending( props: Props ) {
	const translate = useTranslate();
	const { site } = props;
	const pendingInvites = useSelector( ( state ) => getPendingInvitesForSite( state, site.ID ) );

	function goBack() {
		const fallback = site?.slug ? '/people/team/' + site?.slug : '/people/team';

		page.redirect( fallback );
	}

	return (
		<Main>
			<PageViewTracker
				path="/people/pending-invites/:site"
				title="People > Pending Invite People"
			/>
			<NavigationHeader
				navigationItems={ [] }
				title={ translate( 'Users' ) }
				subtitle={ translate(
					'Invite subscribers and team members to your site and manage their access settings. {{learnMore}}Learn more{{/learnMore}}.',
					{
						components: {
							learnMore: (
								<InlineSupportLink
									showIcon={ false }
									supportLink={ localizeUrl( 'https://wordpress.com/support/invite-people/' ) }
								/>
							),
						},
					}
				) }
			/>
			<HeaderCake onClick={ goBack }>{ translate( 'Pending invites' ) }</HeaderCake>
			<TeamInvites />
			{ ! pendingInvites?.length && (
				<EmptyContent
					title={ translate( 'Oops, the invites list is empty' ) }
					illustration="/calypso/images/illustrations/illustration-empty-results.svg"
				/>
			) }
		</Main>
	);
}
