/** @format */

/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import classnames from 'classnames';

export default class LoggedOutFormLinkItem extends React.Component {
	static propTypes = { className: PropTypes.string };

	render() {
		return (
			<a
				{ ...this.props }
				className={ classnames( 'logged-out-form__link-item', this.props.className ) }
			>
				{ this.props.children }
			</a>
		);
	}
}
