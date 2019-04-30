/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Modal from 'react-modal';
import classnames from 'classnames';

class DialogBase extends Component {
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
		onDialogClose: PropTypes.func,
		shouldCloseOnEsc: PropTypes.bool,
	};

	static defaultProps = {
		baseClassName: 'dialog',
		isBackdropVisible: true,
		isFullScreen: true,
		autoFocus: true,
		label: '',
	};

	render() {
		const {
				additionalClassNames,
				isBackdropVisible,
				baseClassName,
				isFullScreen,
				shouldCloseOnEsc,
			} = this.props,
			contentClassName = baseClassName + '__content',
			// Previous implementation used a `<Card />`, styling still relies on the 'card' class being present
			dialogClassName = classnames( baseClassName, 'card', additionalClassNames ),
			backdropClassName = classnames( baseClassName + '__backdrop', {
				'is-full-screen': !! isFullScreen,
				'is-hidden': ! isBackdropVisible,
			} );

		return (
			<Modal
				isOpen={ this.props.isVisible }
				onRequestClose={ this._close }
				closeTimeoutMS={ this.props.leaveTimeout }
				contentLabel={ this.props.label }
				overlayClassName={ backdropClassName } // We use flex here which react-modal doesn't
				className={ dialogClassName }
				htmlOpenClassName="ReactModal__Html--open"
				role="dialog"
				shouldCloseOnEsc={ shouldCloseOnEsc }
			>
				<div className={ classnames( this.props.className, contentClassName ) } tabIndex="-1">
					{ this.props.children }
				</div>
				{ this._renderButtonsBar() }
			</Modal>
		);
	}

	_renderButtonsBar() {
		const baseClassName = this.props.baseClassName,
			buttonsClassName = baseClassName + '__action-buttons';

		if ( ! this.props.buttons ) {
			return null;
		}

		return (
			<div className={ buttonsClassName }>
				{ this.props.buttons.map( this._renderButton, this ) }
			</div>
		);
	}

	_renderButton( button, index ) {
		if ( React.isValidElement( button ) ) {
			return React.cloneElement( button, { key: 'dialog-button-' + index } );
		}

		const classes = this._getButtonClasses( button ),
			clickHandler = this._onButtonClick.bind( this, button );

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

	_getButtonClasses( button ) {
		let classes = button.className || 'button';

		if ( button.isPrimary || this.props.buttons.length === 1 ) {
			classes += ' is-primary';
		}

		if ( button.additionalClassNames ) {
			classes += ' ' + button.additionalClassNames;
		}

		return classes;
	}

	_onButtonClick = button => {
		if ( button.onClick ) {
			button.onClick( this._close.bind( this, button.action ) );
			return;
		}

		this._close( button.action );
	};

	_close = action => {
		if ( this.props.onDialogClose ) {
			this.props.onDialogClose( action );
		}
	};
}

export default DialogBase;
