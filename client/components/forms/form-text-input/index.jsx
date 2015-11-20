/**
 * External dependencies
 */
var React = require( 'react/addons' ),
	joinClasses = require( 'react/lib/joinClasses' ),
	omit = require( 'lodash/object/omit' ),
	classNames = require( 'classnames' );

module.exports = React.createClass( {

	displayName: 'FormTextInput',

	getDefaultProps: function() {
		return {
			isError: false,
			isValid: false,
			selectOnFocus: false,
			type: 'text'
		};
	},

	render: function() {
		var otherProps = omit( this.props, [ 'className', 'type' ] ),
			classes = classNames( {
				'form-text-input': true,
				'is-error': this.props.isError,
				'is-valid': this.props.isValid
			} );

		return (
			<input
				{ ...otherProps }
				type={ this.props.type }
				className={ joinClasses( this.props.className, classes ) }
				onClick={ this.props.selectOnFocus ? this.selectOnFocus : null }
				/>
		);
	},

	selectOnFocus: function( event ) {
		event.target.select();
	}

} );
