/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import omit from 'lodash.omit';
import classNames from 'classnames';

/**
 * Internal dependencies
 */

export default class FormNumberInput extends React.Component {
	static propTypes = {
		isError: PropTypes.bool,
	}

	render() {
		const otherProps = omit( this.props, [ 'className', 'type' ] );

		const classes = classNames(
			this.props.className,
			{
				'form-number-input': true,
				'form-number-input__is-error': this.props.isError,
			}
		);

		return (
			<input { ...otherProps } type="number" className={ classes } />
		);
	}
}

