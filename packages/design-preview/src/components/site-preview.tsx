import { ThemePreview } from '@automattic/design-picker';
import classnames from 'classnames';
import AnimatedFullscreen from './animated-fullscreen';

interface SitePreviewProps {
	url: string;
	inlineCss?: string;
	isFullscreen?: boolean;
	animated?: boolean;
	description?: string;
	isExternallyManaged?: boolean;
	screenshot?: string;
	recordDeviceClick: ( device: string ) => void;
}

const SitePreview: React.FC< SitePreviewProps > = ( {
	url,
	inlineCss = '',
	isFullscreen,
	animated,
	isExternallyManaged,
	screenshot,
	description,
	recordDeviceClick,
} ) => {
	if ( isExternallyManaged ) {
		return (
			<div className="design-preview__screenshot-wrapper">
				<img className="design-preview__screenshot" src={ screenshot } alt={ description } />
			</div>
		);
	}

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
