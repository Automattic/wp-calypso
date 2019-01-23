/** @format */

/**
 * External dependencies
 */
import { Component } from '@wordpress/element';

/**
 * Internal dependencies
 */
import IsoPocComponent from './component.js';

class IsoPocSave extends Component {
	render() {
		const { attributes } = this.props;
		const { align, content, complex, simple } = attributes;
		const alignClassName = align ? `align${ align }` : null;
		return (
			<IsoPocComponent
				className={ alignClassName }
				content={ content }
				complex={ complex }
				simple={ simple }
			/>
		);
	}
}

export default IsoPocSave;
