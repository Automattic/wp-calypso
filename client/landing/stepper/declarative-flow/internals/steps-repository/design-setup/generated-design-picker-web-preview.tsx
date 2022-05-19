import { getDesignPreviewUrl } from '@automattic/design-picker';
import classnames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import WebPreview from 'calypso/components/web-preview/content';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import PreviewToolbar from './preview-toolbar';
import type { Design } from '@automattic/design-picker';

interface Site {
	ID: string;
	URL: string;
}

interface GeneratedDesignPickerWebPreview {
	site?: Site;
	design: Design;
	locale: string;
	verticalId: string;
	isSelected: boolean;
	isPrivateAtomic: boolean;
	translate: ReturnType< typeof useTranslate >;
	recordTracksEvent: typeof recordTracksEvent;
}

const GeneratedDesignPickerWebPreview: ReactFC< GeneratedDesignWebPreviewProps > = ( {
	site,
	design,
	locale,
	verticalId,
	isSelected,
	isPrivateAtomic,
	translate,
	recordTracksEvent,
} ) => {
	return (
		<WebPreview
			className={ classnames( { 'is-selected': isSelected } ) }
			showPreview
			showClose={ false }
			showEdit={ false }
			showDeviceSwitcher={ false }
			previewUrl={ getDesignPreviewUrl( design, {
				language: locale,
				verticalId,
			} ) }
			loadingMessage={ translate( '{{strong}}One moment, please…{{/strong}} loading your site.', {
				components: { strong: <strong /> },
			} ) }
			toolbarComponent={ PreviewToolbar }
			fetchPriority={ isSelected ? 'high' : 'low' }
			autoHeight
			siteId={ site?.ID }
			url={ site?.URL }
			isPrivateAtomic={ isPrivateAtomic }
			translate={ translate }
			recordTracksEvent={ recordTracksEvent }
		/>
	);
};

export default GeneratedDesignPickerWebPreview;
