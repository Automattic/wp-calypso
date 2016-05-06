/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import PureComponent from 'react-pure-render/component';
import classnames from 'classnames';

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
