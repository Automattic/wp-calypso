import page from '@automattic/calypso-router';
import { SiteDetails } from '@automattic/data-stores';
import { useTranslate, fixMe } from 'i18n-calypso';
import EmptyContent from 'calypso/components/empty-content';
import HeaderCake from 'calypso/components/header-cake';
import Main from 'calypso/components/main';
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
			<HeaderCake onClick={ goBack }>{ translate( 'Pending invites' ) }</HeaderCake>
			<TeamInvites />
			{ ! pendingInvites?.length && (
				<EmptyContent
					title={ fixMe( {
						text: 'The invites list is empty',
						newCopy: translate( 'The invites list is empty' ),
						oldCopy: translate( 'Oops, the invites list is empty' ),
					} ) }
				/>
			) }
		</Main>
	);
}
