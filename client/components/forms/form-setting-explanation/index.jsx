/**
 * External dependencies
 */
var React = require( 'react/addons' ),
	joinClasses = require( 'react/lib/joinClasses' ),
	omit = require( 'lodash/object/omit' );

module.exports = React.createClass( {

	displayName: 'FormSettingExplanation',

	render: function() {
		return (
			<p { ...omit( this.props, 'className' ) } className={ joinClasses( this.props.className, 'form-setting-explanation' ) } >
				{ this.props.children }
			</p>
		);
	}
} );
