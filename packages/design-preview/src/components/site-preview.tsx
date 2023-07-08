import { ThemePreview } from '@automattic/design-picker';
import classnames from 'classnames';
import AnimatedFullscreen from './animated-fullscreen';

interface SitePreviewProps {
	url: string;
	inlineCss?: string;
	isFullscreen?: boolean;
	animated?: boolean;
	recordDeviceClick: ( device: string ) => void;
}

const SitePreview: React.FC< SitePreviewProps > = ( {
	url,
	inlineCss = '',
	isFullscreen,
	animated,
	recordDeviceClick,
} ) => {
	return (
		<AnimatedFullscreen
			className={ classnames( 'design-preview__site-preview', {
				'design-preview__site-preview--animated': animated,
			} ) }
			isFullscreen={ isFullscreen }
			enabled={ animated }
		>
			<ThemePreview
				url={ url }
				inlineCss={ inlineCss }
				isShowFrameBorder
				isShowDeviceSwitcher
				isFullscreen={ isFullscreen }
				recordDeviceClick={ recordDeviceClick }
			/>
		</AnimatedFullscreen>
	);
};

export default SitePreview;
