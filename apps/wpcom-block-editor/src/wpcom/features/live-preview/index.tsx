import { useSelect } from '@wordpress/data';
import domReady from '@wordpress/dom-ready';
import { registerPlugin } from '@wordpress/plugins';
import LivePreviewNoticePlugin from './live-preview-notice-plugin';

const LivePreviewPlugin = () => {
	const siteEditorStore = useSelect( ( select ) => select( 'core/edit-site' ), [] );

	// Do nothing outside the Site Editor context.
	if ( ! siteEditorStore ) {
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
