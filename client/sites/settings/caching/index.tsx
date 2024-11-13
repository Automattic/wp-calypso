import { useTranslate } from 'i18n-calypso';
import InlineSupportLink from 'calypso/components/inline-support-link';
import NavigationHeader from 'calypso/components/navigation-header';
import Notice from 'calypso/components/notice';
import { useAreHostingFeaturesSupported } from 'calypso/sites/features';
import CachingForm from './form';

import './style.scss';

export default function CachingSettings() {
	const translate = useTranslate();
	const isSupported = useAreHostingFeaturesSupported();

	const renderNotSupportedNotice = () => {
		return (
			<Notice showDismiss={ false } status="is-warning">
				{ translate( 'This setting is not supported for this site.' ) }
			</Notice>
		);
	};

	return (
		<div className="tools-caching">
			<NavigationHeader
				title={ translate( 'Caching' ) }
				subtitle={ translate( 'Manage your site’s server-side caching. {{a}}Learn more{{/a}}', {
					components: {
						a: <InlineSupportLink supportContext="hosting-clear-cache" showIcon={ false } />,
					},
				} ) }
			/>
			{ isSupported ? <CachingForm /> : renderNotSupportedNotice() }
		</div>
	);
}
