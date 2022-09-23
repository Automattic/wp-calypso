import { ThemePreview } from '@automattic/design-picker';
import { translate } from 'i18n-calypso';

interface SitePreviewProps {
	url: string;
	inlineCss?: string;
	recordDeviceClick: ( device: string ) => void;
}

const SitePreview: React.FC< SitePreviewProps > = ( {
	url,
	inlineCss = '',
	recordDeviceClick,
} ) => {
	return (
		<div className="design-preview__site-preview">
			<ThemePreview
				url={ url }
				loadingMessage={ translate( '{{strong}}One moment, please…{{/strong}} loading your site.', {
					components: { strong: <strong /> },
				} ) }
				inlineCss={ inlineCss }
				isShowFrameBorder
				isShowDeviceSwitcher
				recordDeviceClick={ recordDeviceClick }
			/>
		</div>
	);
};

export default SitePreview;
