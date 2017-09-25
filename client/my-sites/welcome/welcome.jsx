/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */

module.exports = React.createClass( {

	displayName: 'Welcome',

	getInitialState: function() {
		return {
			visible: !! this.props.isVisible
		};
	},

	componentWillReceiveProps: function( nextProps ) {
		const nextVisible = !! nextProps.isVisible;
		if ( nextVisible !== this.state.visible ) {
			this.setState( {
				visible: nextVisible
			} );
		}
	},

	close: function( event ) {
		event.preventDefault();

		this.setState( {
			visible: false
		} );

		if ( 'function' === typeof( this.props.closeAction ) ) {
			this.props.closeAction();
		}
	},

	render: function() {
		const welcomeClassName = ( this.props.additionalClassName ) ? this.props.additionalClassName + ' welcome-message' : 'welcome-message';

		if ( this.state.visible ) {
			return (
				<div className={ welcomeClassName }>
					<a href="#" className="close-button" onClick={ this.close }><span className="noticon noticon-close"></span></a>
					{ this.props.children }
				</div>
			);
		} else {
			return null;
		}
	}
} );
