import { ThemePreview } from '@automattic/design-picker';

interface SitePreviewProps {
	url: string;
	inlineCss?: string;
	isFullscreen?: boolean;
	recordDeviceClick: ( device: string ) => void;
}

const SitePreview: React.FC< SitePreviewProps > = ( {
	url,
	inlineCss = '',
	isFullscreen,
	recordDeviceClick,
} ) => {
	return (
		<div className="design-preview__site-preview">
			<ThemePreview
				url={ url }
				inlineCss={ inlineCss }
				isShowFrameBorder={ ! isFullscreen }
				isShowDeviceSwitcher
				isFullscreen={ isFullscreen }
				recordDeviceClick={ recordDeviceClick }
			/>
		</div>
	);
};

export default SitePreview;
