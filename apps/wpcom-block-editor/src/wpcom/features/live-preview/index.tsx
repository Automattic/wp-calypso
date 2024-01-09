import { useSelect } from '@wordpress/data';
import domReady from '@wordpress/dom-ready';
import { registerPlugin } from '@wordpress/plugins';
import { Suspense, lazy } from 'react';

const LivePreviewNoticePlugin = lazy(
	() => import( /* webpackChunkName: "wpcom-live-preview-notice" */ './live-preview-notice-plugin' )
);

const LivePreviewPlugin = () => {
	const siteEditorStore = useSelect( ( select ) => select( 'core/edit-site' ), [] );

	// Do nothing outside the Site Editor context.
	if ( ! siteEditorStore ) {
		return null;
	}

	return (
		<Suspense fallback={ null }>
			<LivePreviewNoticePlugin />
		</Suspense>
	);
};

const registerLivePreviewPlugin = () => {
	registerPlugin( 'wpcom-live-preview', {
		render: () => <LivePreviewPlugin />,
	} );
};

domReady( () => {
	registerLivePreviewPlugin();
} );
