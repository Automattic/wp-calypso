/** @format */
/**
 * External dependencies
 */
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { Component } from 'react';

class Focusable extends Component {
	static propTypes = {
		onClick: PropTypes.func.isRequired,
		onKeyDown: PropTypes.func,
	};

	onKeyDown = event => {
		const { onClick, onKeyDown } = this.props;
		if ( onClick && ( event.key === 'Enter' || event.key === ' ' ) ) {
			event.preventDefault();
			onClick( event );
		}
		if ( onKeyDown ) {
			onKeyDown( event );
		}
	};

	render = () => {
		const { children, className, ...passProps } = this.props;
		return (
			<div
				{ ...passProps }
				className={ classNames( 'focusable', className ) }
				role="button"
				tabIndex="0"
				onKeyDown={ this.onKeyDown }
			>
				{ children }
			</div>
		);
	};
}

export default Focusable;
