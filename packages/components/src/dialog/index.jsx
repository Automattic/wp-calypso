/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Modal from 'react-modal';
import classnames from 'classnames';

/**
 * Style dependencies
 */
import './style.scss';

class Dialog extends Component {
	static propTypes = {
		additionalClassNames: PropTypes.oneOfType( [ PropTypes.object, PropTypes.string ] ),
		autoFocus: PropTypes.bool,
		baseClassName: PropTypes.string,
		buttons: PropTypes.array,
		className: PropTypes.string,
		isBackdropVisible: PropTypes.bool,
		isFullScreen: PropTypes.bool,
		isVisible: PropTypes.bool,
		label: PropTypes.string,
		leaveTimeout: PropTypes.number,
		onClose: PropTypes.func,
		shouldCloseOnEsc: PropTypes.bool,
	};

	static defaultProps = {
		autoFocus: true,
		baseClassName: 'dialog',
		isBackdropVisible: true,
		isFullScreen: true,
		isVisible: false,
		label: '',
		leaveTimeout: 200,
	};

	renderButtonsBar() {
		if ( ! this.props.buttons ) {
			return null;
		}

		return (
			<div className={ this.props.baseClassName + '__action-buttons' }>
				{ this.props.buttons.map( this.renderButton, this ) }
			</div>
		);
	}

	renderButton( button, index ) {
		if ( React.isValidElement( button ) ) {
			return React.cloneElement( button, { key: 'dialog-button-' + index } );
		}

		const classes = this.getButtonClasses( button );
		const clickHandler = this.onButtonClick.bind( this, button );

		return (
			<button
				key={ button.action }
				className={ classes }
				data-e2e-button={ button.action }
				data-tip-target={ `dialog-base-action-${ button.action }` }
				onClick={ clickHandler }
				disabled={ !! button.disabled }
			>
				<span className={ this.props.baseClassName + '__button-label' }>{ button.label }</span>
			</button>
		);
	}

	getButtonClasses( button ) {
		return classnames( button.className || 'button', button.additionalClassNames, {
			'is-primary': button.isPrimary || this.props.buttons.length === 1,
		} );
	}

	onButtonClick( button ) {
		if ( button.onClick ) {
			button.onClick( this.close.bind( this, button.action ) );
			return;
		}

		this.close( button.action );
	}

	close = ( action ) => {
		if ( this.props.onClose ) {
			this.props.onClose( action );
		}
	};

	render() {
		const {
			additionalClassNames,
			isBackdropVisible,
			className,
			baseClassName,
			isFullScreen,
			shouldCloseOnEsc,
		} = this.props;

		// Previous implementation used a `<Card />`, styling still relies on the 'card' class being present
		const dialogClassName = classnames( baseClassName, 'card', additionalClassNames );

		const backdropClassName = classnames( baseClassName + '__backdrop', {
			'is-full-screen': isFullScreen,
			'is-hidden': ! isBackdropVisible,
		} );

		const contentClassName = classnames( baseClassName + '__content', className );

		return (
			<Modal
				isOpen={ this.props.isVisible }
				onRequestClose={ this.close }
				closeTimeoutMS={ this.props.leaveTimeout }
				contentLabel={ this.props.label }
				overlayClassName={ backdropClassName } // We use flex here which react-modal doesn't
				className={ dialogClassName }
				htmlOpenClassName="ReactModal__Html--open"
				role="dialog"
				shouldCloseOnEsc={ shouldCloseOnEsc }
			>
				<div className={ contentClassName } tabIndex={ -1 }>
					{ this.props.children }
				</div>
				{ this.renderButtonsBar() }
			</Modal>
		);
	}
}

export default Dialog;
