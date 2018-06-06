/** @format */
/**
 * External dependencies
 */
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { noop } from 'lodash';

class Focusable extends Component {
	static propTypes = {
		onClick: PropTypes.func.isRequired,
		onKeyDown: PropTypes.func,
	};

	static defaultProps = { onClick: noop };

	onKeyDown = event => {
		const { onClick, onKeyDown } = this.props;
		if ( event.key === 'Enter' || event.key === ' ' ) {
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
				onClick={ this.props.onClick }
				onKeyDown={ this.onKeyDown }
			>
				{ children }
			</div>
		);
	};
}

export default Focusable;
