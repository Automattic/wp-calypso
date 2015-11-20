/**
 * External dependencies
 */
var React = require( 'react' ),
	joinClasses = require( 'react/lib/joinClasses' );

/**
 * Internal Dependencies
 */
var layoutFocus = require( 'lib/layout-focus' ),
	Gridicon = require( 'components/gridicon' );

module.exports = React.createClass( {

	displayName: 'MeSidebarItem',

	onClick: function( event ) {
		layoutFocus.setNext( 'content' );
		window.scrollTo( 0, 0 );

		if ( this.props.onClick ) {
			this.props.onClick( event );
		}
	},

	render: function() {
		const selected = this.props.selected ? 'selected' : null;
		return (
			<li className={ joinClasses( this.props.className, selected, 'me-sidebar-item' ) } >
				<a href={ this.props.href } onClick={ this.onClick } target={ 'true' === this.props.external ? '_blank' : null }>
					<Gridicon icon={ this.props.icon } size={ 24 } className="me-sidebar-item__gridicon" />
					<span className="menu-link-text">{ this.props.label }</span>
					{ 'true' === this.props.external ? <Gridicon icon="external" size={ 16 } className="me-sidebar-item__external" /> : null }
				</a>
			</li>
		);
	}
} );
