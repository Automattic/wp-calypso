/**
 * External dependencies
 */
import { find } from 'lodash';
var React = require( 'react' ),
	i18n = require( 'i18n-calypso' );

/**
 * Internal dependencies
 */
var SectionNav = require( 'components/section-nav' ),
	NavTabs = require( 'components/section-nav/tabs' ),
	NavItem = require( 'components/section-nav/item' );

module.exports = React.createClass( {
	propTypes: {
		path: React.PropTypes.string.isRequired
	},

	getNavtabs: function() {
		var tabs = [
			{
				title: i18n.translate( 'Password', { textOnly: true } ),
				path: '/me/security',
			},
			{
				title: i18n.translate( 'Two-Step Authentication', { textOnly: true } ),
				path: '/me/security/two-step',
			},
			{
				title: i18n.translate( 'Connected Applications', { textOnly: true } ),
				path: '/me/security/connected-applications',
			},
			{
				title: i18n.translate( 'Account Recovery', { textOnly: true } ),
				path: '/me/security/account-recovery',
			},
		];

		return tabs;
	},

	getFilteredPath: function() {
		var paramIndex = this.props.path.indexOf( '?' );
		return ( paramIndex < 0 ) ? this.props.path : this.props.path.substring( 0, paramIndex );
	},

	getSelectedText: function() {
		var text = '',
			filteredPath = this.getFilteredPath(),
			found = find( this.getNavtabs(), { path: filteredPath } );

		if ( 'undefined' !== typeof found ) {
			text = found.title;
		}

		return text;
	},

	onClick: function() {
		window.scrollTo( 0, 0 );
	},

	render: function() {
		return (
			<SectionNav selectedText={ this.getSelectedText() }>
				<NavTabs>
					{ this.getNavtabs().map( function( tab ) {
						return (
							<NavItem
								key={ tab.path }
								onClick={ this.onClick }
								path={ tab.path }
								selected={ tab.path === this.getFilteredPath() }
							>
								{ tab.title }
							</NavItem>
						);
					}, this ) }
				</NavTabs>
			</SectionNav>
		);
	}
} );
