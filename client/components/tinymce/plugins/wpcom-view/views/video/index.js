/**
 * Internal dependencies
 */
import VideoView from './view';
import ShortcodeUtils from 'lib/shortcode';

export function match( content ) {
	const nextMatch = ShortcodeUtils.next( 'wpvideo', content );

	if ( nextMatch ) {
		return {
			index: nextMatch.index,
			content: nextMatch.content,
			options: {
				shortcode: nextMatch.shortcode
			}
		};
	}
}

export function serialize( content ) {
	return encodeURIComponent( content );
}

export function getComponent() {
	return VideoView;
}
