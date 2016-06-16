/**
 * External dependencies
 */
var ReactDom = require( 'react-dom' ),
	React = require( 'react' ),
	withClickOutside = require( 'react-click-outside' ),
	closest = require( 'component-closest' ),
	noop = require( 'lodash/noop' ),
	classnames = require( 'classnames' );

/**
 * Internal dependencies
 */
var closeOnEsc = require( 'lib/mixins/close-on-esc' ),
	Card = require( 'components/card' ),
	trapFocus = require( 'lib/mixins/trap-focus' );

// Subclass <Card> component to extend with "click outside" behavior.".
var DialogBaseCard = withClickOutside( React.createClass( {

	render: function() {
		return <Card {...this.props} />
	},

	handleClickOutside: function( event ) {
		this.props.onClickOutside( event );
	}
} ) );

var DialogBase = React.createClass( {
	mixins: [ closeOnEsc( '_close' ), trapFocus ],

	displayName: 'DialogBase',

	getDefaultProps: function() {
		return {
			baseClassName: 'dialog',
			isFullScreen: true,
			autoFocus: true,
			onClickOutside: noop
		};
	},

	componentDidMount: function() {
		// set focus after a short timeout in order to avoid
		// interrupting any CSS transitions (Chrome issue)
		this._focusTimeout = setTimeout( function() {
			this._focusTimeout = false;
			if ( this.props.autoFocus ) {
				ReactDom.findDOMNode( this.refs.content ).focus();
			}
		}.bind( this ), 10 );
		document.documentElement.classList.add( 'no-scroll' );
	},

	componentWillUnmount: function() {
		if ( this._focusTimeout ) {
			clearTimeout( this._focusTimeout );
			this._focusTimeout = false;
		}

		document.documentElement.classList.remove( 'no-scroll' );
	},

	render: function() {
		var baseClassName = this.props.baseClassName,
			backdropClassName = baseClassName + '__backdrop',
			dialogClassName = baseClassName,
			contentClassName = baseClassName + '__content';

		if ( this.props.additionalClassNames ) {
			dialogClassName = classnames( this.props.additionalClassNames, dialogClassName );
		}

		if ( this.props.isFullScreen ) {
			backdropClassName = classnames( 'is-full-screen', backdropClassName );
		}

		return (
			<div className={ backdropClassName } ref="backdrop">
				<DialogBaseCard className={ dialogClassName } role="dialog" onClickOutside={ this._onBackgroundClick }>
					<div className={ classnames( this.props.className, contentClassName ) } ref="content" tabIndex="-1">
						{ this.props.children }
					</div>
					{ this._renderButtonsBar() }
				</DialogBaseCard>
			</div>
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

	_onBackgroundClick: function( event ) {
		// In cases of Dialogception (Dialog inside a Dialog), we want to
		// prevent a click outside the currently visible Dialog from closing
		// any dialogs below.
		var isBackdropOrLowerStackingContext = (
			! this.refs ||
			ReactDom.findDOMNode( this.refs.backdrop ).contains( event.target ) || // Clicked on this dialog's backdrop
			! closest( event.target, '.dialog__backdrop', true ) // Clicked offscreen, but not from another dialog
		);

		if ( ! isBackdropOrLowerStackingContext ) {
			return;
		}

		const shouldStayOpen = this.props.onClickOutside( event );

		if ( ! shouldStayOpen ) {
			this._close();
		}
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
