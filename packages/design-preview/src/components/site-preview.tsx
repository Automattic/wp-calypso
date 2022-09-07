import { ThemePreview } from '@automattic/design-picker';
import { translate } from 'i18n-calypso';

interface SitePreviewProps {
	url: string;
	inlineCss?: string;
}

const SitePreview: React.FC< SitePreviewProps > = ( { url, inlineCss = '' } ) => {
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
			/>
		</div>
	);
};

export default SitePreview;
