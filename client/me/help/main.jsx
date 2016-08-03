/**
 * External dependencies
 */
var React = require( 'react' ),
	PureRenderMixin = require( 'react-pure-render/mixin' ),
	debug = require( 'debug' )( 'calypso:help-search' ),
	reactRedux = require( 'react-redux' );
/**
 * Internal dependencies
 */
var Main = require( 'components/main' ),
	analytics = require( 'lib/analytics' ),
	currentUser = require( 'state/current-user/selectors' ),
	HappinessEngineers = require( 'me/help/help-happiness-engineers' ),
	MeSidebarNavigation = require( 'me/sidebar-navigation' ),
	HelpSearch = require( './help-search' ),
	CompactCard = require( 'components/card/compact' ),
	Button = require( 'components/button' ),
	SectionHeader = require( 'components/section-header' ),
	HelpResult = require( './help-results/item' ),
	HelpUnverifiedWarning = require( './help-unverified-warning' );

const Help = React.createClass( {
	displayName: 'Help',

	mixins: [ PureRenderMixin ],

	getHelpfulArticles: function() {
		const helpfulResults = [
			{
				link: 'https://en.support.wordpress.com/com-vs-org/',
				title: this.translate( 'Can\'t add your theme or plugin?' ),
				description: this.translate( 'Learn about the differences between a fully hosted WordPress.com site and a self-hosted WordPress.org site. Themes and plugins can be uploaded to self-hosted sites only.' )
			},
			{
				link: 'https://en.support.wordpress.com/all-about-domains/',
				title: this.translate( 'All About Domains' ),
				description: this.translate( 'Set up your domain whether it’s registered with WordPress.com or elsewhere.' )
			},
			{
				link: 'https://en.support.wordpress.com/start/',
				title: this.translate( 'Get Started' ),
				description: this.translate( 'No matter what kind of site you want to build, our five-step checklists will get you set up and ready to publish.' )
			},
			{
				link: 'https://en.support.wordpress.com/settings/privacy-settings/',
				title: this.translate( 'Privacy Settings' ),
				description: this.translate( 'Limit your site’s visibility or make it completely private.' )
			}
		];

		return (
			<div className="help-results">
				<SectionHeader label={ this.translate( 'Most Helpful Articles' ) } />
				{ helpfulResults.map( ( result, index ) => {
					const trackClick = () => {
						debug( 'Suggested result click: ', result.link );
						analytics.tracks.recordEvent( 'calypso_help_suggested_result_click', {
							link: result.link,
							position: index
						} );
					};

					return <HelpResult key={ result.link } helpLink={ result } iconTypeDescription="book" onClick={ trackClick } />
				} ) }
			</div>
		);
	},

	getSupportLinks: function() {
		return (
			<div className="help__support-links">
				<CompactCard className="help__support-link" href="https://support.wordpress.com/" target="__blank">
					<div className="help__support-link-section">
						<h2 className="help__support-link-title">{ this.translate( 'All support articles' ) }</h2>
						<p className="help__support-link-content">{ this.translate( 'Looking to learn more about a feature? Our docs have all the details.' ) }</p>
					</div>
				</CompactCard>
				<CompactCard className="help__support-link" href="https://dailypost.wordpress.com/" target="__blank">
					<div className="help__support-link-section">
						<h2 className="help__support-link-title">{ this.translate( 'The Daily Post' ) }</h2>
						<p className="help__support-link-content">{ this.translate( 'Get daily tips for your blog and connect with others to share your journey.' ) }</p>
					</div>
				</CompactCard>
				<CompactCard className="help__support-link help__support-link-contact" href="/help/contact/">
					<div className="help__support-link-section">
						<h2 className="help__support-link-title">{ this.translate( 'Get in touch' ) }</h2>
						<p className="help__support-link-content">{ this.translate( 'Can\'t find the answer? Drop us a line and we\'ll lend a hand.' ) }</p>
					</div>
					<Button className="help__support-link-button" primary>{ this.translate( 'Contact Us' ) }</Button>
				</CompactCard>
		</div>
		);
	},

	render: function() {
		return (
			<Main className="help">
				<MeSidebarNavigation />
				<HelpSearch />
				{ ! this.props.isEmailVerified && <HelpUnverifiedWarning /> }
				{ this.getHelpfulArticles() }
				{ this.getSupportLinks() }
				<HappinessEngineers />
			</Main>
		);
	}
} );

module.exports = reactRedux.connect(
	( state ) => {
		return {
			isEmailVerified: currentUser.isCurrentUserEmailVerified( state ),
		};
	}
)( Help );
