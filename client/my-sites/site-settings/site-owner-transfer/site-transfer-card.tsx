import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';
import ActionPanel from 'calypso/components/action-panel';
import HeaderCake from 'calypso/components/header-cake';
import InlineSupportLink from 'calypso/components/inline-support-link';
import Main from 'calypso/components/main';
import NavigationHeader from 'calypso/components/navigation-header';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';

const ActionPanelStyled = styled( ActionPanel )( {
	fontSize: '14px',
	fontWeight: 400,
	'.action-panel__body': {
		color: 'var(--studio-gray-70)',
	},
	'&.action-panel': {
		paddingBottom: '0px',
	},
} );

export function SiteTransferCard( {
	children,
	onClick,
}: {
	children: React.ReactNode;
	onClick: () => void;
} ) {
	const translate = useTranslate();
	return (
		<Main>
			<NavigationHeader
				navigationItems={ [] }
				title={ translate( 'Site Transfer' ) }
				subtitle={ translate(
					'Transfer this site to a new or existing site member with just a few clicks. {{a}}Learn more.{{/a}}',
					{
						components: {
							a: <InlineSupportLink supportContext="site-transfer" showIcon={ false } />,
						},
					}
				) }
			/>

			<PageViewTracker
				path="/settings/start-site-transfer/:site"
				title="Settings > Start Site Transfer"
			/>
			<HeaderCake onClick={ onClick } isCompact>
				<h1>{ translate( 'Site Transfer' ) }</h1>
			</HeaderCake>
			<ActionPanelStyled>{ children }</ActionPanelStyled>
		</Main>
	);
}
