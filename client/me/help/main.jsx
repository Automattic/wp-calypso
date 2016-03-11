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
	Card = require( 'components/card' ),
	CompactCard = require( 'components/card/compact' ),
	Button = require( 'components/button' ),
	SectionHeader = require( 'components/section-header' ),
	Gridicon = require( 'components/gridicon' ),
	HelpResult = require( './help-results/item' );

module.exports = React.createClass( {
	displayName: 'Help',

	mixins: [ PureRenderMixin ],

	getHelpfulArticles: function() {
		const resultItemWP = {
			link: 'https://en.support.wordpress.com/com-vs-org/',
			title: this.translate( 'WordPress.com and WordPress.org' ),
			description: this.translate( 'Learn about the differences between a fully hosted WordPress.com site and a self-hosted WordPress.org site.' )
		};

		const resultItemDomains = {
			link: 'https://en.support.wordpress.com/all-about-domains/',
			title: this.translate( 'All About Domains' ),
			description: this.translate( 'Set up your domain whether it’s registered with WordPress.com or elsewhere.' )
		};

		const resultItemStart = {
			link: 'https://en.support.wordpress.com/start/',
			title: this.translate( 'Get Started' ),
			description: this.translate( 'No matter what kind of site you want to build, our five-step checklists will get you set up and ready to publish.' )
		};

		const resultItemPrivate = {
			link: 'https://en.support.wordpress.com/settings/privacy-settings/',
			title: this.translate( 'Privacy Settings' ),
			description: this.translate( 'Limit your site’s visibility or make it completely private.' )
		};

		return (
			<div className="help-results">
				<SectionHeader label={ this.translate( 'Most Helpful Articles' ) }/>
				<HelpResult key={ resultItemWP.link } helpLink={ resultItemWP } iconTypeDescription="book" />
				<HelpResult key={ resultItemDomains.link } helpLink={ resultItemDomains } iconTypeDescription="book" />
				<HelpResult key={ resultItemStart.link } helpLink={ resultItemStart } iconTypeDescription="book" />
				<HelpResult key={ resultItemPrivate.link } helpLink={ resultItemPrivate } iconTypeDescription="book" />
			</div>
		);
	},
	
	getSupportLinks: function() {
		return (
			<div className="help__support-links">
				<CompactCard className="help__support-link" href="https://support.wordpress.com/" target="__blank">
					<div>
						<h2 className="help__support-link-title">{ this.translate( 'All support articles' ) }</h2>
						<p className="help__support-link-content">{ this.translate( 'Looking to learn more about a feature? Our docs have all the details.' ) }</p>
					</div>
				</CompactCard>
				<CompactCard className="help__support-link" href="https://dailypost.wordpress.com/" target="__blank">
					<div>
						<h2 className="help__support-link-title">{ this.translate( 'The Daily Post' ) }</h2>
						<p className="help__support-link-content">{ this.translate( 'Get daily tips for your blog and connect with others to share your journey.' ) }</p>
					</div>
				</CompactCard>
				<CompactCard className="help__support-link help__support-link-contact" href="/help/contact/">
					<div>
						<h2 className="help__support-link-title">{ this.translate( 'Get in touch' ) }</h2>
						<p className="help__support-link-content">{ this.translate( 'Can\'t find the answer? Drop us a line and we\'ll lend a hand.' ) }</p>
					</div>
					<Button primary>{ this.translate( 'Contact Us' ) }</Button>
				</CompactCard>
		</div>
		);
	},

	render: function() {
		return (
			<Main className="help">
				<MeSidebarNavigation />
				<HelpSearch />
				{ this.getHelpfulArticles() }
				{ this.getSupportLinks() }
				<HappinessEngineers />
			</Main>
		);
	}
} );
