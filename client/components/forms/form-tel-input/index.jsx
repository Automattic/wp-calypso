/**
 * External dependencies
 */
var React = require( 'react' ),
	classnames = require( 'classnames' ),
	omit = require( 'lodash/omit' ),
	classNames = require( 'classnames' );

module.exports = React.createClass( {

	displayName: 'FormTelInput',

	getDefaultProps: function() {
		return {
			isError: false
		};
	},

	render: function() {
		var otherProps = omit( this.props, [ 'className', 'type', 'isError' ] ),
			classes = classNames( {
				'form-tel-input': true,
				'is-error': this.props.isError
			} );

		return (
			<input
				{ ...otherProps }
				type={ 'tel' }
				pattern={ '[0-9]*' }
				className={ classnames( this.props.className, classes ) } />
		);
	}
} );
