/**
 * External dependencies
 */
var React = require( 'react' ),
	classnames = require( 'classnames' );

import Modal from 'react-modal';

/**
 * Internal dependencies
 */
var closeOnEsc = require( 'lib/mixins/close-on-esc' ),
	trapFocus = require( 'lib/mixins/trap-focus' );

var DialogBase = React.createClass( {
	mixins: [ closeOnEsc( '_close' ), trapFocus ],

	displayName: 'DialogBase',

	getDefaultProps: function() {
		return {
			baseClassName: 'dialog',
			isFullScreen: true,
			autoFocus: true
		};
	},

	render: function() {
		var baseClassName = this.props.baseClassName,
			backdropClassName = baseClassName + '__backdrop',
			dialogClassName = classnames( baseClassName, 'card' ), // Previous implementation used a `<Card />`, styling relies on this
			contentClassName = baseClassName + '__content';

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
				contentLabel={ 'Abc' }
				overlayClassName={ backdropClassName } // We use flex here which react-modal doesn't
				className={ dialogClassName }
				role="dialog">
				<div className={ classnames( this.props.className, contentClassName ) } ref="content" tabIndex="-1">
					{ this.props.children }
				</div>
				{ this._renderButtonsBar() }
			</Modal>
		);
	},

	_renderButtonsBar: function() {
		var baseClassName = this.props.baseClassName,
			buttonsClassName = baseClassName + '__action-buttons';

		if ( ! this.props.buttons ) {
			return null;
		}

		return (
			<div className={ buttonsClassName } ref="actionButtons">
				{ this.props.buttons.map( this._renderButton, this ) }
			</div>
		);
	},

	_renderButton: function( button, index ) {
		if ( React.isValidElement( button ) ) {
			return React.cloneElement( button, { key: 'dialog-button-' + index } );
		}

		let classes = this._getButtonClasses( button ),
			clickHandler = this._onButtonClick.bind( this, button );

		return (
			<button key={ button.action } className={ classes } onClick={ clickHandler } disabled={ !! button.disabled }>
				<span className={ this.props.baseClassName + '__button-label' }>{ button.label }</span>
			</button>
		);
	},

	_getButtonClasses: function( button ) {
		var classes = button.className || 'button';

		if ( button.isPrimary || this.props.buttons.length === 1 ) {
			classes += ' is-primary';
		}

		if ( button.additionalClassNames ) {
			classes += ' ' + button.additionalClassNames;
		}

		return classes;
	},

	_onButtonClick: function( button ) {
		if ( button.onClick ) {
			button.onClick( this._close.bind( this, button.action ) );
			return;
		}

		this._close( button.action );
	},

	_close: function( action ) {
		if ( this.props.onDialogClose ) {
			this.props.onDialogClose( action );
		}
	}
} );

module.exports = DialogBase;
