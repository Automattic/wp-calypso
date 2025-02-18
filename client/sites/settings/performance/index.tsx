import { useTranslate } from 'i18n-calypso';
import InlineSupportLink from 'calypso/components/inline-support-link';
import NavigationHeader from 'calypso/components/navigation-header';
import { Panel } from 'calypso/components/panel';
import CachingForm from './form';

export default function PerformanceSettings() {
	const translate = useTranslate();

	return (
		<Panel className="settings-performance">
			<NavigationHeader
				title={ translate( 'Performance' ) }
				subtitle={ translate(
					'Manage your site’s performance, including server-side caching. {{a}}Learn more{{/a}}',
					{
						components: {
							a: <InlineSupportLink supportContext="hosting-clear-cache" showIcon={ false } />,
						},
					}
				) }
			/>
			<CachingForm />
		</Panel>
	);
}
