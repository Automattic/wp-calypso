/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import PostEditButton from 'blocks/post-edit-button';
import Card from 'components/card';

export default class PostEditButtonExample extends React.PureComponent {
	static displayName = 'PostEditButtonExample';

	render() {
		const post = { ID: 123, type: 'post' };
		const site = { slug: 'example.com' };
		return (
			<div className="design-assets__group">
				<h2>
					<a href="/devdocs/design/edit-button">Post Edit Button</a>
				</h2>
				<PostEditButton post={ post } site={ site } />
			</div>
		);
	}
}
