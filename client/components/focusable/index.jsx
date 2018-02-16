/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import classNames from 'classnames';
import { omit } from 'lodash';
import PropTypes from 'prop-types';

class Focusable extends Component {
	static propTypes = {
		onClick: PropTypes.func.isRequired,
		onKeyDown: PropTypes.func,
	};

	onClick = event => {
		const { onClick } = this.props;
		onClick( event );
	};

	onKeyDown = event => {
		const { onClick, onKeyDown = false } = this.props;
		if ( event.key === 'Enter' || event.key === ' ' ) {
			event.preventDefault();
			onClick( event );
		}
		if ( onKeyDown ) {
			onKeyDown( event );
		}
	};

	render = () => {
		const { children, className } = this.props;
		const omitProps = [ 'children', 'className', 'onClick', 'onKeyDown', 'role', 'tabIndex' ];
		const props = omit( this.props, omitProps );
		return (
			<div
				className={ classNames( 'focusable', className ) }
				role="button"
				tabIndex="0"
				onClick={ this.onClick }
				onKeyDown={ this.onKeyDown }
				{ ...props }
			>
				{ children }
			</div>
		);
	};
}

export default Focusable;
