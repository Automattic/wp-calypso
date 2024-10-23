import { useSelect } from '@wordpress/data';
import domReady from '@wordpress/dom-ready';
import { registerPlugin } from '@wordpress/plugins';
import { usePreviewingThemeSlug } from './hooks/use-previewing-theme';
import LivePreviewNoticePlugin from './live-preview-notice-plugin';

const LivePreviewPlugin = () => {
	const siteEditorStore = useSelect( ( select ) => select( 'core/edit-site' ), [] );
	const previewingThemeSlug = usePreviewingThemeSlug();

	// Do nothing outside the Site Editor context.
	if ( ! siteEditorStore ) {
		return null;
	}

	// Don't render unless the user is previewing a theme.
	if ( ! previewingThemeSlug ) {
		return null;
	}

	return <LivePreviewNoticePlugin />;
};

const registerLivePreviewPlugin = () => {
	registerPlugin( 'wpcom-live-preview', {
		render: () => <LivePreviewPlugin />,
	} );
};

domReady( () => {
	registerLivePreviewPlugin();
} );
