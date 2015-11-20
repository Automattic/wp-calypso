/**
 * External dependencies
 */
var React = require( 'react/addons' ),
	joinClasses = require( 'react/lib/joinClasses' ),
	omit = require( 'lodash/object/omit' ),
	classNames = require( 'classnames' );

module.exports = React.createClass( {

	displayName: 'FormTelInput',

	getDefaultProps: function() {
		return {
			isError: false
		};
	},

	render: function() {
		var otherProps = omit( this.props, [ 'className', 'type' ] ),
			classes = classNames( {
				'form-tel-input': true,
				'is-error': this.props.isError
			} );

		return (
			<input
				{ ...otherProps }
				type={ 'tel' }
				pattern={ '[0-9]*'}
				className={ joinClasses( this.props.className, classes ) } />
		);
	}
} );
