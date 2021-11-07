import { Component } from 'react';
import ReaderPostOptionsMenu from 'calypso/blocks/reader-post-options-menu';

export default class ReaderPostOptionsMenuExample extends Component {
	static displayName = 'ReaderPostOptionsMenuExample';

	render() {
		const post = {
			site_URL: 'http://discover.wordpress.com',
		};

		// Narrow container so popover appears in a reasonable spot
		const wrapperStyles = {
			width: '30px',
		};

		return (
			<div className="design-assets__group">
				<h2>
					<a href="/devdocs/blocks/reader-post-options-menu">Reader Post Options Menu</a>
				</h2>
				<div style={ wrapperStyles }>
					<ReaderPostOptionsMenu position="bottom left" post={ post } />
				</div>
			</div>
		);
	}
}
