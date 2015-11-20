/**
 * External dependencies
 */
var React = require( 'react' ),
	find = require( 'lodash/collection/find' );

/**
 * Internal dependencies
 */
var i18n = require( 'lib/mixins/i18n' ),
	SectionNav = require( 'components/section-nav' ),
	NavTabs = require( 'components/section-nav/tabs' ),
	NavItem = require( 'components/section-nav/item' ),
	config = require( 'config' );

module.exports = React.createClass( {
	propTypes: {
		path: React.PropTypes.string.isRequired
	},

	getDefaultProps: function() {
		return {
			tabs: [
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
				config.isEnabled( 'me/security/checkup' ) ? {
					title: i18n.translate( 'Checkup', { textOnly: true } ),
					path: '/me/security/checkup',
				} : false
			]
		};
	},

	getSelectedText: function() {
		var text = '',
			found = find( this.props.tabs, function( tab ) {
				return this.props.path === tab.path;
			}, this );

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
					{ this.props.tabs.map( function( tab ) {
						return (
							<NavItem
								key={ tab.path }
								onClick={ this.onClick }
								path={ tab.path }
								selected={ tab.path === this.props.path }
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
