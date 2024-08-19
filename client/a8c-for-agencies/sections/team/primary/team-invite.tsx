import { useTranslate } from 'i18n-calypso';
import Layout from 'calypso/a8c-for-agencies/components/layout';
import LayoutBody from 'calypso/a8c-for-agencies/components/layout/body';
import LayoutHeader, {
	LayoutHeaderBreadcrumb as Breadcrumb,
} from 'calypso/a8c-for-agencies/components/layout/header';
import LayoutTop from 'calypso/a8c-for-agencies/components/layout/top';
import { A4A_TEAM_LINK } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';

export default function TeamInvite() {
	const translate = useTranslate();
	const title = translate( 'Invite a team member' );

	return (
		<Layout className="a4a-team-list" title={ title } wide>
			<LayoutTop>
				<LayoutHeader>
					<Breadcrumb
						items={ [
							{ label: translate( 'Manage team members' ), href: A4A_TEAM_LINK },
							{ label: title },
						] }
					/>
				</LayoutHeader>
			</LayoutTop>
			<LayoutBody>Team invite</LayoutBody>
		</Layout>
	);
}
