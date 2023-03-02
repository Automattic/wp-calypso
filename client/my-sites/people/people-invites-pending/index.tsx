import { SiteDetails } from '@automattic/data-stores';
import { useTranslate } from 'i18n-calypso';
import page from 'page';
import HeaderCake from 'calypso/components/header-cake';
import Main from 'calypso/components/main';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import TeamInvites from 'calypso/my-sites/people/team-invites';

interface Props {
	site: SiteDetails;
}

export default function PeopleInvitesPending( props: Props ) {
	const { site } = props;
	const translate = useTranslate();

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
		</Main>
	);
}
