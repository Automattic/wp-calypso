/**
 * External dependencies
 */
var React = require( 'react' ),
	classNames = require( 'classnames' ),
	Gridicon = require( 'components/gridicon' );

module.exports = React.createClass( {

	displayName: 'PluginIcon',

	render: function() {
		var className = classNames( {
			'plugin-icon': true,
			'is-placeholder': this.props.isPlaceholder,
			'is-fallback': ! this.props.image
		} ),
		avatar = ( this.props.isPlaceholder || ! this.props.image ) ? <Gridicon icon="plugins" /> : <img className="plugin-icon__img" src={ this.props.image } />;

		return (
			<div className={ classNames( this.props.className, className ) } >
				{ avatar }
			</div>
		);
	}
} );
