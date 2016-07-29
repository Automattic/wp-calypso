/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import AuthorCompactProfile from 'blocks/author-compact-profile';
import Card from 'components/card';

export default React.createClass( {

	displayName: 'AuthorCompactProfile',

	render() {
		const author = {
			avatar_URL: 'https://0.gravatar.com/avatar/cf55adb1a5146c0a11a808bce7842f7b?s=96&d=identicon',
			name: 'Bob The Tester',
			URL: 'http://wpcalypso.wordpress.com'
		};

		return (
			<div className="design-assets__group">
				<h2>
					<a href="/devdocs/blocks/author-compact-profile">Author Compact Profile</a>
				</h2>
				<Card>
					<AuthorCompactProfile
						author={ author }
						siteName={ 'Bananas' }
						siteUrl={ 'http://wpcalypso.wordpress.com' }
						followCount={ 123 }
						feedId={ 1 }
						siteId={ null } />
				</Card>
			</div>
		);
	}
} );
