/**
 * External dependencies
 */
import classnames from 'classnames';
import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';

export default class SpinnerLine extends PureComponent {
	render() {
		const classes = classnames( 'spinner-line', this.props.className );

		return (
			<hr className={ classes } />
		);
	}
}

SpinnerLine.propTypes = {
	className: PropTypes.string
};
