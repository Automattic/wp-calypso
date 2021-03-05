/**
 * External dependencies
 */

import React from 'react';

/**
 * Internal dependencies
 */
import AuthorCompactProfile from 'calypso/blocks/author-compact-profile';
import { Card } from '@automattic/components';

export default class AuthorCompactProfileExample extends React.Component {
	static displayName = 'AuthorCompactProfileExample';

	render() {
		const author = {
			avatar_URL: 'https://0.gravatar.com/avatar/cf55adb1a5146c0a11a808bce7842f7b?s=96&d=identicon',
			name: 'Bob The Tester',
			URL: 'http://wpcalypso.wordpress.com',
		};

		return (
			<Card>
				<AuthorCompactProfile
					author={ author }
					siteName={ 'Bananas' }
					siteUrl={ 'http://wpcalypso.wordpress.com' }
					followCount={ 123 }
					feedId={ 1 }
					siteId={ null }
				/>
			</Card>
		);
	}
}
