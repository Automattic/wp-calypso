/**
 * External dependencies
 */
var React = require( 'react' );

/**
 * Internal dependencies
 */
var isExternal = require( 'lib/url' ).isExternal,
	Gridicon = require( 'components/gridicon' );

/**
 * Component
 */
var SidebarMenuItem = React.createClass( {
	propTypes: {
		label: React.PropTypes.string.isRequired,
		className: React.PropTypes.string.isRequired,
		link: React.PropTypes.string.isRequired,
		buttonLink: React.PropTypes.string,
		buttonLabel: React.PropTypes.string,
		onNavigate: React.PropTypes.func,
		icon: React.PropTypes.string,
	},

	renderButton: function( link ) {
		if ( ! link ) {
			return null;
		}

		return (
			<a
				rel={ isExternal( link ) ? 'external' : null }
				onClick={ this.props.onNavigate }
				href={ link }
				target={ isExternal( link ) ? '_blank' : null }
				className="add-new">
				{ this.props.buttonLabel || this.translate( 'Add' ) }
			</a>
		);
	},

	render: function() {
		const isExternalLink = isExternal( this.props.link );

		return (
			<li className={ this.props.className }>
				<a onClick={ this.props.onNavigate } href={ this.props.link } target={ isExternalLink ? '_blank' : null }>
					<Gridicon icon={ this.props.icon } size={ 24 } />
					<span className="menu-link-text">{ this.props.label }</span>
					{ isExternalLink ? <span className="noticon noticon-external" /> : null }
				</a>
				{ this.renderButton( this.props.buttonLink ) }
			</li>
		);
	}
} );

module.exports = SidebarMenuItem;
