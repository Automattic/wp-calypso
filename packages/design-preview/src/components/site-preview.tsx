import { ThemePreview } from '@automattic/design-picker';

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
				inlineCss={ inlineCss }
				isShowFrameBorder
				isShowDeviceSwitcher
				recordDeviceClick={ recordDeviceClick }
			/>
		</div>
	);
};

export default SitePreview;
