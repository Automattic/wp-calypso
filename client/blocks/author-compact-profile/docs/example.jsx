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
		return (
			<div className="design-assets__group">
				<h2>
					<a href="/devdocs/blocks/author-compact-profile">Author Compact Profile</a>
				</h2>
				<Card>
					<AuthorCompactProfile />
				</Card>
			</div>
		);
	}
} );
