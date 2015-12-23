/**
 * External dependencies
 */
var React = require( 'react' ),
	classnames = require( 'classnames' ),
	omit = require( 'lodash/object/omit' );

module.exports = React.createClass( {

	displayName: 'FormSettingExplanation',

	render: function() {
		return (
			<p { ...omit( this.props, 'className' ) } className={ classnames( this.props.className, 'form-setting-explanation' ) } >
				{ this.props.children }
			</p>
		);
	}
} );
