/**
 * External dependencies
 */
import React from 'react';
import ReactDom from 'react-dom';
import Clipboard from 'clipboard';
import { omit, noop } from 'lodash';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import Button from 'components/button';

module.exports = React.createClass( {
	displayName: 'ClipboardButton',

	propTypes: {
		className: React.PropTypes.string,
		text: React.PropTypes.string,
		onCopy: React.PropTypes.func
	},

	getDefaultProps: function() {
		return {
			onCopy: noop
		};
	},

	componentDidMount: function() {
		var button = ReactDom.findDOMNode( this.refs.button );
		this.clipboard = new Clipboard( button, {
			text: () => this.props.text
		} );
		this.clipboard.on( 'success', this.props.onCopy );
		this.clipboard.on( 'error', this.displayPrompt );
	},

	componentWillUnmount: function() {
		this.clipboard.destroy();
		delete this.clipboard;
	},

	displayPrompt: function() {
		window.prompt( this.translate( 'Highlight and copy the following text to your clipboard:' ), this.props.text );
	},

	render: function() {
		var classes = classNames( 'clipboard-button', this.props.className );

		return (
			<Button
				ref="button"
				{ ...omit( this.props, Object.keys( this.constructor.propTypes ) ) }
				className={ classes } />
		);
	}
} );
