/**
 * Wordpress dependencies
 */

import { Component } from '@wordpress/element';

/**
 * External dependencies
 */

import classnames from 'classnames';

/**
 * Internal dependencies
 */

/**
 * Module variables
 */

class StarterSave extends Component {
	render() {
		const {
			className,
			attributes
		} = this.props;
		const {
			foo,
			align
		} = attributes;
		const classes = classnames(
			className,
			align ? `align${ align }` : null,
		);
		return (
			<div
				className={ classes }
				data-foo={ foo }
			/>
		);
	}
}

export default StarterSave;
