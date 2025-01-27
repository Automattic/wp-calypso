import { useTranslate } from 'i18n-calypso';
import InlineSupportLink from 'calypso/components/inline-support-link';
import NavigationHeader from 'calypso/components/navigation-header';
import { Panel } from 'calypso/components/panel';
import SharingConnections from './connections';

import '../style.scss';
import './style.scss';

export default function MarketingConnections( {
	siteId,
	isP2Hub,
}: {
	siteId: number;
	isP2Hub: boolean;
} ) {
	const translate = useTranslate();
	return (
		<Panel
			wide
			className="marketing-connections connections__sharing-settings connections__sharing-connections"
		>
			<NavigationHeader
				title={ translate( 'Connections' ) }
				subtitle={ translate(
					'Connect your site to social networks and other services. {{learnMoreLink/}}',
					{
						components: {
							learnMoreLink: (
								<InlineSupportLink key="publicize" supportContext="publicize" showIcon={ false } />
							),
						},
					}
				) }
			/>
			<SharingConnections isP2Hub={ isP2Hub } siteId={ siteId } />
		</Panel>
	);
}
