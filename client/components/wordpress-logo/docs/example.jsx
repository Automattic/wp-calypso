/**
* External dependencies
*/
import React from 'react';

/**
 * Internal dependencies
 */
import WordPressLogo from 'components/wordpress-logo';
import Card from 'components/card';

module.exports = React.createClass( {
	displayName: 'WordPressLogo',

	render() {
		return (
			<div className="design-assets__group">
				<h2>
					<a href="/devdocs/design/wordpress-logo">WordPress Logo</a>
				</h2>
				<Card>
					<div>
						<WordPressLogo size={ 200 } />
						<WordPressLogo size={ 100 } />
						<WordPressLogo size={ 36 } />
					</div>
				</Card>
			</div>
		);
	}
} );
