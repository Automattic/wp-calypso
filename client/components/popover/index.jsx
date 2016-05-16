/**
 * External dependencies
 */
import withClickOutside from 'react-click-outside';
import defer from 'lodash/defer';
import ReactDom from 'react-dom';
import React from 'react';
import omit from 'lodash/omit';
import Tip from 'component-tip';
import { Provider as ReduxProvider } from 'react-redux';

/**
 * Internal dependencies
 */
import closeOnEsc from 'lib/mixins/close-on-esc';
import warn from 'lib/warn';

// Create <Content> component and extend with "click outside" behavior.
var Content = withClickOutside( React.createClass( {
	mixins: [ closeOnEsc( '_close' ) ],

	render: function() {
		return (
			<div { ...this.props } tabIndex="-1" />
		);
	},

	handleClickOutside( event ) {
		this.props.onClickOutside( event );
  },

	_close: function() {
		this.props.onClose();
	}
} ) );

var Popover = React.createClass( {
	propTypes: {
		isVisible: React.PropTypes.bool.isRequired,
		onClose: React.PropTypes.func.isRequired,
		position: React.PropTypes.string,
		ignoreContext: React.PropTypes.shape( { getDOMNode: React.PropTypes.function } ),
	},

	contextTypes: {
		store: React.PropTypes.object
	},

	getDefaultProps: function() {
		return {
			position: 'top',
			className: 'popover'
		};
	},

	componentDidMount: function() {
		this._showOrHideTip( {} );
	},

	componentDidUpdate: function( prevProps ) {
		this._showOrHideTip( prevProps );
	},

	componentWillUnmount: function() {
		this._tip.remove();
		ReactDom.unmountComponentAtNode( this._container );
		this._container = null;
	},

	render: function() {
		return null;
	},

	_initTip: function() {
		this._tip = new Tip( '' );
		this._tip.classname = this.props.className;
		this._container = this._tip.inner;
	},

	_renderTip: function() {
		let content = <Content { ...omit( this.props, 'className' ) } onClickOutside={ this._onClickOutside } onClose={ this._close } />;

		// Context is lost when creating a new render hierarchy, so ensure
		// that we preserve the context that we care about
		if ( this.context.store ) {
			content = (
				<ReduxProvider store={ this.context.store }>
					{ content }
				</ReduxProvider>
			);
		}

		// this schedules a render, but does not actually render the content
		ReactDom.render( content, this._container );
	},

	_showTip: function() {
		// defer showing the content to give it a chance to render
		defer( () => {
			const contextNode = ReactDom.findDOMNode( this.props.context );
			if ( contextNode.nodeType !== Node.ELEMENT_NODE || contextNode.nodeName.toLowerCase() === 'svg' ) {
				warn(
					'Popover is attached to a %s element (nodeType %d).  ' +
					'This causes problems in IE11 - see 12168-gh-calypso-pre-oss.',
					contextNode.nodeName,
					contextNode.nodeType
				);
			}

			this._tip.position( this.props.position, { auto: true } );
			this._tip.show( contextNode );

			if ( this.props.onShow ) {
				this.props.onShow();
			}
		} );
	},

	_hideTip: function() {
		ReactDom.unmountComponentAtNode( this._container );
		this._tip.hide();
	},

	_showOrHideTip: function( prevProps ) {
		if ( ! this._tip ) {
			this._initTip();
		}
		if ( this.props.isVisible && this.props.context ) {
			this._renderTip();
			if ( ! prevProps.isVisible ) {
				this._showTip();
			}
		} else {
			this._hideTip();
		}
	},

	_onClickOutside: function( event ) {
		let shouldClose = true;

		if ( this.props.ignoreContext ) {
			const ignoreContext = ReactDom.findDOMNode( this.props.ignoreContext );
			shouldClose = ignoreContext && ignoreContext.contains && ! ignoreContext.contains( event.target );
		}

		if ( shouldClose ) {
			// Defer execution of `_close` to prevent "double event" when Popover's
			// content is visible AND clicking outside of its content AND on its
			// toggle/open element.
			// Problem: With synchronous execution, react-click-outside will register
			// a `click` event on the <Content> element before it registers on the
			// containing <Popover> element. This bubbling click event will allow
			// `_close` to be called moments before `_showOrHideTip` which will now
			// see the component as closed and reopen it.
			// Solution: By removing the call to `_close` from the call stack with
			// `defer`, the toggle inside of `_showOrHideTip` behaves as expected
			// and when the duplicative call is executed, it can be ignored with a
			// simple check of `this.props.isVisible`.
			defer( () => this._close( event ) );
		}
	},

	_close: function( event ) {
		// This check prevents a duplicate call to `this.props.onClose` when the
		// popover is closed using the toggle.
		if ( this.props.isVisible ) {
			this.props.onClose( event );
		}
	}
} );

module.exports = Popover;
