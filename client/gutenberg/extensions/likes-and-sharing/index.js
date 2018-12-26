/** @format */

/**
 * A Gutenberg sidebar extension that allows enabling/disabling
 * likes and sharing buttons.
 *
 * Hooks into our dedicated Jetpack plugin sidebar to display the UI.
 */

/**
 * Internal dependencies
 */
import JetpackPluginSidebar from 'gutenberg/extensions/presets/jetpack/editor-shared/jetpack-plugin-sidebar';
import LikesAndSharesPanel from './panel';

export const name = 'likes-and-sharing';

export const settings = {
	render: () => (
		// const { meta: { switch_like_status } = {}, updateMeta } = this.props;

		<JetpackPluginSidebar>
			<LikesAndSharesPanel />
		</JetpackPluginSidebar>
	),
};

// Fetch the post meta.
// const applyWithSelect = withSelect( ( select ) => {
// 	const { getEditedPostAttribute } = select( 'core/editor' );

// 	return {
// 		meta: getEditedPostAttribute( 'meta' ),
// 	};
// } );

// Provide method to update post meta.
// const applyWithDispatch = withDispatch( ( dispatch, { meta } ) => {
// 	const { editPost } = dispatch( 'core/editor' );

// 	return {
// 		updateMeta( newMeta ) {
// 			editPost( { meta: { ...meta, ...newMeta } } ); // Important: Old and new meta need to be merged in a non-mutating way!
// 		},
// 	};
// } );

// Combine the higher-order components.
// const render = compose( [
// 	applyWithSelect,
// 	applyWithDispatch
// ] )( LikesPlugin );

// registerPlugin( 'wpcom-likes', {
// 	render: render,
// } );
