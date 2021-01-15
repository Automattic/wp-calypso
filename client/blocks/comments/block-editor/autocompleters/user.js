/* eslint-disable wpcalypso/jsx-classname-namespace */
/**
 * External dependencies
 */
import React from 'react';

export default ( suggestions ) => ( {
	name: 'users',
	className: 'editor-autocompleters__user',
	triggerPrefix: '@',
	options: suggestions,
	isDebounced: true,
	getOptionKeywords( user ) {
		return [ user.user_login, user.display_name ];
	},
	getOptionLabel( user ) {
		const avatar =
			user.avatar_urls && user.image_URL ? (
				<img
					key="avatar"
					className="editor-autocompleters__user-avatar"
					alt=""
					src={ user.image_URL }
				/>
			) : (
				<span className="editor-autocompleters__no-avatar"></span>
			);

		return [
			avatar,
			<span key="name" className="editor-autocompleters__user-name">
				{ user.display_name }
			</span>,
			<span key="slug" className="editor-autocompleters__user-slug">
				{ user.user_login }
			</span>,
		];
	},
	getOptionCompletion( user ) {
		return `@${ user.user_login }`;
	},
} );
