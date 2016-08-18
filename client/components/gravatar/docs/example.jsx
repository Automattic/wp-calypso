/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Gravatar from 'components/gravatar';

export default React.createClass( {

	displayName: 'Gravatar',

	render() {
		const user = {
			avatar_URL: 'https://0.gravatar.com/avatar/cf55adb1a5146c0a11a808bce7842f7b?s=96&d=identicon',
			display_name: 'Bob The Tester'
		};

		return (
			<div className="design-assets__group">
				<h2>
					<a href="/devdocs/components/gravatar">Gravatar</a>
				</h2>
				<Gravatar user={ user } size={ 96 } />
			</div>
		);
	}
} );
