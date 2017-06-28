/**
 * External dependencies
 */
var React = require( 'react' ),
	classnames = require( 'classnames' ),
	omit = require( 'lodash/omit' );

module.exports = React.createClass( {

	displayName: 'FormLabel',

	propTypes: {
		required: React.PropTypes.bool,
	},

	render: function() {
		return (
			<label { ...omit( this.props, 'className' ) } className={ classnames( this.props.className, 'form-label' ) } >
				{ this.props.children }
				{ this.props.required && (
					<span className="form-label__required"> *</span>
				) }
			</label>
		);
	}
} );
