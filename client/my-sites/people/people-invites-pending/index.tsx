import { SiteDetails } from '@automattic/data-stores';
import { localizeUrl } from '@automattic/i18n-utils';
import { useTranslate } from 'i18n-calypso';
import page from 'page';
import FormattedHeader from 'calypso/components/formatted-header';
import HeaderCake from 'calypso/components/header-cake';
import InlineSupportLink from 'calypso/components/inline-support-link';
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
			<FormattedHeader
				brandFont
				className="people__page-heading"
				headerText={ translate( 'Users' ) }
				subHeaderText={ translate(
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
				align="left"
				hasScreenOptions
			/>
			<HeaderCake onClick={ goBack }>{ translate( 'Pending invites' ) }</HeaderCake>
			<TeamInvites />
		</Main>
	);
}
