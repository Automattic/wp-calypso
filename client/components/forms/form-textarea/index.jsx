/**
 * External dependencies
 */
var React = require( 'react' ),
	classnames = require( 'classnames' ),
	omit = require( 'lodash/omit' );

export default React.createClass( {

	displayName: 'FormTextarea',

	render: function() {
		return (
			<textarea { ...omit( this.props, 'className' ) } className={ classnames( this.props.className, 'form-textarea' ) } >
				{ this.props.children }
			</textarea>
		);
	}
} );
