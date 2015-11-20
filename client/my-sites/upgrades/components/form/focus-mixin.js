var React = require( 'react/addons' );

/**
 * Provides focus and blur support to input component.
 *
 * @param {string} name ref name of the input component
 * @return {function} Mixin factory
 * @see https://facebook.github.io/react/docs/more-about-refs.html for more information
 */
module.exports = function( name ) {
	return {
		componentDidMount: function() {
			if ( this.props.initialFocus && this.refs[ name ] ) {
				React.findDOMNode( this.refs[ name ] ).focus();
			}
		},

		getInitialState: function() {
			return { focus: false };
		},

		handleFocus: function( event ) {
			this.setState( { focus: true } );

			if ( this.props.onFocus ) {
				this.props.onFocus( event );
			}
		},

		handleBlur: function( event ) {
			this.setState( { focus: false } );

			if ( this.props.onBlur ) {
				this.props.onBlur( event );
			}
		}
	};
};
