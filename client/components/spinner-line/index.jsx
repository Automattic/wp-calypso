/**
 * External dependencies
 */
import PropTypes from 'prop-types';

import React, { PureComponent } from 'react';
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
