/** @format */

/**
 * External dependencies
 */

import { Component } from '@wordpress/element';
import { RichText } from '@wordpress/editor';
import classNames from 'classnames';

class GiphySave extends Component {
	render() {
		const { attributes, className } = this.props;
		const { align, caption, giphyUrl, searchText, topPadding } = attributes;
		const style = {
			paddingTop: `${ topPadding }%`,
		};
		const classes = classNames( className, `align${ align }` );
		return (
			<div className={ classes }>
				<figure style={ style }>
					<iframe src={ giphyUrl } title={ searchText } />
				</figure>
				<RichText.Content className="caption" value={ caption } tagName="figcaption" />
			</div>
		);
	}
}

export default GiphySave;
