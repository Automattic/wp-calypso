/**
 * External dependencies
 */
var React = require( 'react' ),
	PureRenderMixin = require( 'react-pure-render/mixin' );

/**
 * Internal dependencies
 */
var Main = require( 'components/main' ),
	HappinessEngineers = require( 'me/help/help-happiness-engineers' ),
	FormSectionHeading = require( 'components/forms/form-section-heading' ),
	MeSidebarNavigation = require( 'me/sidebar-navigation' ),
	HelpSearch = require( './help-search' ),
	ExternalLink = require( 'components/external-link' ),
	Card = require( 'components/card' );

module.exports = React.createClass( {
	displayName: 'Help',

	mixins: [ PureRenderMixin ],

	getSupportLinks: function() {
		return (
			<Card>
				<div className="help__support-link">
					<h2 className="help__support-link-title">
						<ExternalLink icon={ true } href="https://support.wordpress.com/" target="__blank">{ this.translate( 'Support docs' ) }</ExternalLink>
					</h2>
					<p className="help__support-link-content">{ this.translate( 'Looking to learn more about a feature? Our docs have all the details.' ) }</p>
				</div>
				<div className="help__support-link">
					<h2 className="help__support-link-title">
						<ExternalLink icon={ true } href="https://dailypost.wordpress.com/" target="__blank">{ this.translate( 'The Daily Post' ) }</ExternalLink>
					</h2>
					<p className="help__support-link-content">{ this.translate( 'Get daily tips for your blog and connect with others to share your journey.' ) }</p>
				</div>
				<div className="help__support-link">
					<h2 className="help__support-link-title">
						<a href="/help/contact/">{ this.translate( 'Contact us' ) }</a>
					</h2>
					<p className="help__support-link-content">{ this.translate( 'Can\'t find the answer? Drop us a line and we\'ll lend a hand.' ) }</p>
				</div>
			</Card>
		);
	},

	render: function() {
		return (
			<Main className="help">
				<MeSidebarNavigation />
				<FormSectionHeading className="help__header">{ this.translate( 'How can we help?' ) }</FormSectionHeading>
				<HelpSearch />
				{ this.getSupportLinks() }
				<HappinessEngineers />
			</Main>
		);
	}
} );
