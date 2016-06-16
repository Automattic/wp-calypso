/**
 * External dependencies
 */
var React = require( 'react' ),
	classnames = require( 'classnames' ),
	omit = require( 'lodash/omit' );

module.exports = React.createClass( {

	displayName: 'Checkbox',

	propTypes: {
		disabled: React.PropTypes.bool,
		checked: React.PropTypes.bool
	},

	getDefaultProps() {
		return {
			disabled: false
		};
	},

	render: function() {
		var otherProps = omit( this.props, [ 'className', 'type' ] );

		return (
			<input { ...otherProps } type="checkbox" className={ classnames( this.props.className, 'checkbox' ) } />
		);
	}
} );
