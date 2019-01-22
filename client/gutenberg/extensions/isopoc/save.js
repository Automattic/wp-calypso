/** @format */

/**
 * External dependencies
 */

import { Component } from '@wordpress/element';
import { RichText } from '@wordpress/editor';

class IsoPocSave extends Component {
	render() {
		const { attributes } = this.props;
		const { align, content, complex, simple } = attributes;
		const alignClassName = align ? `align${ align }` : null;
		return (
			<div
				className={ alignClassName }
				data-simple={ simple }
				data-complex={ JSON.stringify( complex ) }
			>
				<RichText.Content tagName="figcaption" value={ content } />
			</div>
		);
	}
}

export default IsoPocSave;
