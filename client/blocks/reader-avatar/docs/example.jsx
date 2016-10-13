/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import ReaderAvatar from 'blocks/reader-avatar';

export default React.createClass( {

	displayName: 'ReaderAvatar',

	render() {
		const author = {
			avatar_URL: 'https://0.gravatar.com/avatar/cf55adb1a5146c0a11a808bce7842f7b?s=96&d=identicon',
			name: 'Bob The Tester',
			URL: 'http://wpcalypso.wordpress.com'
		};

		return (
			<div className="design-assets__group">
				<h2>
					<a href="/devdocs/blocks/reader-avatar">Reader Avatar</a>
				</h2>
				<ReaderAvatar />
			</div>
		);
	}
} );
