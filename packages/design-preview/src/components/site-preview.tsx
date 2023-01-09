import { ThemePreview } from '@automattic/design-picker';
import { useI18n } from '@wordpress/react-i18n';

interface SitePreviewProps {
	url: string;
	inlineCss?: string;
	recordDeviceClick: ( device: string ) => void;
}

// Determine whether the preview URL is from the WPCOM site preview endpoint.
// This endpoint allows more preview capabilities via window.postMessage().
const isUrlWpcomApi = ( url: string ) =>
	url.indexOf( 'public-api.wordpress.com/wpcom/v2/block-previews/site' ) >= 0;

const SitePreview: React.FC< SitePreviewProps > = ( {
	url,
	inlineCss = '',
	recordDeviceClick,
} ) => {
	const { __ } = useI18n();
	return (
		<div className="design-preview__site-preview">
			{ isUrlWpcomApi( url ) ? (
				<ThemePreview
					url={ url }
					inlineCss={ inlineCss }
					isShowFrameBorder
					isShowDeviceSwitcher
					recordDeviceClick={ recordDeviceClick }
				/>
			) : (
				<img
					className="design-preview__site-preview-image"
					src={ url }
					alt={ __( 'Preview', __i18n_text_domain__ ) }
				/>
			) }
		</div>
	);
};

export default SitePreview;
