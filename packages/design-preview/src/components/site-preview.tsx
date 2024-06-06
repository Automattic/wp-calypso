import { ThemePreview } from '@automattic/design-picker';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import photon from 'photon';
import AnimatedFullscreen from './animated-fullscreen';

interface SitePreviewProps {
	url: string;
	inlineCss?: string;
	isFullscreen?: boolean;
	animated?: boolean;
	isExternallyManaged?: boolean;
	screenshot?: string;
	title: string;
	recordDeviceClick: ( device: string ) => void;
}

const SitePreview: React.FC< SitePreviewProps > = ( {
	url,
	inlineCss = '',
	isFullscreen,
	animated,
	isExternallyManaged,
	screenshot,
	title,
	recordDeviceClick,
} ) => {
	const translate = useTranslate();

	if ( isExternallyManaged ) {
		if ( screenshot === undefined ) {
			return null;
		}

		const width = 1000;
		const photonSrc = screenshot && photon( screenshot, { width } );
		const scrSet =
			photonSrc &&
			`${ photon( screenshot, { width, zoom: 2 } ) } 2x,
		${ photon( screenshot, { width, zoom: 3 } ) } 3x`;

		return (
			<div className="design-preview__screenshot-wrapper">
				<img
					className="design-preview__screenshot"
					alt={ translate( 'Screenshot of the %(themeName)s theme', {
						args: { themeName: title },
					} ).toString() }
					src={ photonSrc || screenshot }
					srcSet={ scrSet || undefined }
				/>
			</div>
		);
	}

	return (
		<AnimatedFullscreen
			className={ clsx( 'design-preview__site-preview', {
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
