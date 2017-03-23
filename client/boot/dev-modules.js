/**
 * External dependencies
 */
import ReactClass from 'react/lib/ReactClass';

/**
 * Internal dependencies
 */
import config from 'config';
import RenderVisualizerMixin from 'lib/mixins/render-visualizer';

export default function() {
	if ( config.isEnabled( 'render-visualizer' ) ) {
		// Use Webpack's code splitting feature to put the render visualizer in a separate fragment.
		// This way it won't get downloaded unless this feature is enabled.
		// Since loading this fragment is asynchronous and we need to inject this mixin into all React classes,
		// we have to wait for it to load before proceeding with the application's startup.
		ReactClass.injection.injectMixin( RenderVisualizerMixin );
	}
}
