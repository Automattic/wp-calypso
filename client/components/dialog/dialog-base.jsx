/**
 * External dependencies
 */
import React, { Component } from 'react';
import Modal from 'react-modal';
import classnames from 'classnames';

class DialogBase extends Component {
	static defaultProps = {
		baseClassName: 'dialog',
		isFullScreen: true,
		autoFocus: true,
		label: ''
	}

	render() {
		const baseClassName = this.props.baseClassName,
			contentClassName = baseClassName + '__content';

		let backdropClassName = baseClassName + '__backdrop',
			dialogClassName = classnames( baseClassName, 'card' ); // Previous implementation used a `<Card />`, styling relies on this

		if ( this.props.additionalClassNames ) {
			dialogClassName = classnames( this.props.additionalClassNames, dialogClassName );
		}

		if ( this.props.isFullScreen ) {
			backdropClassName = classnames( 'is-full-screen', backdropClassName );
		}

		return (
			<Modal isOpen={ this.props.isVisible }
				onRequestClose={ this._close }
				closeTimeoutMS= { this.props.leaveTimeout }
				contentLabel={ this.props.label }
				overlayClassName={ backdropClassName } // We use flex here which react-modal doesn't
				className={ dialogClassName }
				role="dialog">
				<div className={ classnames( this.props.className, contentClassName ) } ref="content" tabIndex="-1">
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
			<div className={ buttonsClassName } ref="actionButtons">
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
			<button key={ button.action } className={ classes } onClick={ clickHandler } disabled={ !! button.disabled }>
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

	_onButtonClick = ( button ) => {
		if ( button.onClick ) {
			button.onClick( this._close.bind( this, button.action ) );
			return;
		}

		this._close( button.action );
	}

	_close = ( action ) => {
		if ( this.props.onDialogClose ) {
			this.props.onDialogClose( action );
		}
	}
}

export default DialogBase;
