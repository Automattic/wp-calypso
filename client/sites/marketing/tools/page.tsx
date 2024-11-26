import { useTranslate } from 'i18n-calypso';
import NavigationHeader from 'calypso/components/navigation-header';
import { Panel } from 'calypso/components/panel';
import Tools from '.';

export default function MarketingTools() {
	const translate = useTranslate();

	return (
		<Panel wide>
			<NavigationHeader
				title={ translate( 'Marketing Tools' ) }
				subtitle={ translate(
					'Explore tools to build your audience, market your site, and engage your visitors.'
				) }
			/>
			<Tools />
		</Panel>
	);
}
