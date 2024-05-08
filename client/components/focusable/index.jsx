import clsx from 'clsx';
import PropTypes from 'prop-types';
import { Component } from 'react';

import './style.scss';

class Focusable extends Component {
	static propTypes = {
		onClick: PropTypes.func.isRequired,
		onKeyDown: PropTypes.func,
	};

	onKeyDown = ( event ) => {
		const { onClick, onKeyDown } = this.props;
		if ( onClick && ( event.key === 'Enter' || event.key === ' ' ) ) {
			event.preventDefault();
			onClick( event );
		}
		if ( onKeyDown ) {
			onKeyDown( event );
		}
	};

	render() {
		const { className, ...passProps } = this.props;
		return (
			<div
				{ ...passProps }
				className={ clsx( 'focusable', className ) }
				role="button"
				tabIndex="0"
				onKeyDown={ this.onKeyDown }
			/>
		);
	}
}

export default Focusable;
