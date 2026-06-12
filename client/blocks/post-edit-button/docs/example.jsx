import { PureComponent } from 'react';
import PostEditButton from 'calypso/blocks/post-edit-button';

export default class PostEditButtonExample extends PureComponent {
	static displayName = 'PostEditButtonExample';

	render() {
		const post = { ID: 123, type: 'post' };
		const site = { slug: 'example.com' };
		return (
			<div className="design-assets__group">
				<h2>Post Edit Button</h2>
				<PostEditButton post={ post } site={ site } />
			</div>
		);
	}
}
