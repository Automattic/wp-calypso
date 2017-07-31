/**
 * External dependencies
 */
var React = require( 'react' ),
	classNames = require( 'classnames' ),
	omit = require( 'lodash/omit' );

/**
 * Internal dependencies
 */
var Toggle = require( 'components/forms/form-toggle' );

module.exports = React.createClass( {

	displayName: 'CompactFormToggle',

	render: function() {
		return (
			<Toggle
				{ ...omit( this.props, 'className' ) }
				className={ classNames( this.props.className, 'is-compact' ) }
			>
				{ this.props.children }
			</Toggle>
		);
	}
} );
