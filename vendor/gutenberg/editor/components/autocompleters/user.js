/**
 * WordPress dependencies
 */
import apiRequest from '@wordpress/api-request';

/**
* A user mentions completer.
*
* @type {Completer}
*/
export default {
	name: 'users',
	className: 'editor-autocompleters__user',
	triggerPrefix: '@',
	options( search ) {
		let payload = '';
		if ( search ) {
			payload = '?search=' + encodeURIComponent( search );
		}
		return apiRequest( { path: '/wp/v2/users' + payload } );
	},
	isDebounced: true,
	getOptionKeywords( user ) {
		return [ user.slug, user.name ];
	},
	getOptionLabel( user ) {
		return [
			<img key="avatar" className="editor-autocompleters__user-avatar" alt="" src={ user.avatar_urls[ 24 ] } />,
			<span key="name" className="editor-autocompleters__user-name">{ user.name }</span>,
			<span key="slug" className="editor-autocompleters__user-slug">{ user.slug }</span>,
		];
	},
	allowNode() {
		return true;
	},
	getOptionCompletion( user ) {
		return `@${ user.slug }`;
	},
};
