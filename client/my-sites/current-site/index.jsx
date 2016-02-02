/**
 * External dependencies
 */
var React = require( 'react' ),
	debug = require( 'debug' )( 'calypso:my-sites:current-site' ),
	url = require( 'url' );

/**
 * Internal dependencies
 */
var AllSites = require( 'my-sites/all-sites' ),
	analytics = require( 'analytics' ),
	Button = require( 'components/button' ),
	Card = require( 'components/card' ),
	Notice = require( 'components/notice' ),
	NoticeAction = require( 'components/notice/notice-action' ),
	layoutFocus = require( 'lib/layout-focus' ),
	Site = require( 'my-sites/site' ),
	Gridicon = require( 'components/gridicon' ),
	config = require( 'config' ),
	UpgradesActions = require( 'lib/upgrades/actions' ),
	DomainsStore = require( 'lib/domains/store' ),
	DomainWarnings = require( 'my-sites/upgrades/components/domain-warnings' ),
	paths = require( 'my-sites/upgrades/paths' );

module.exports = React.createClass( {
	displayName: 'CurrentSite',

	componentDidMount: function() {
		debug( 'The current site React component is mounted.' );
	},

	propTypes: {
		sites: React.PropTypes.object.isRequired,
		siteCount: React.PropTypes.number.isRequired
	},

	componentWillMount() {
		const selectedSite = this.getSelectedSite();

		if ( selectedSite ) {
			UpgradesActions.fetchDomains( selectedSite.ID );
		}
		this.prevSelectedSite = selectedSite;

		DomainsStore.on( 'change', this.handleStoreChange );
	},

	componentWillUnmount: function() {
		DomainsStore.off( 'change', this.handleStoreChange );
	},

	getInitialState: function() {
		return {
			domainsStore: DomainsStore
		};
	},

	componentWillUpdate() {
		const selectedSite = this.getSelectedSite();

		if ( selectedSite && this.prevSelectedSite !== selectedSite ) {
			UpgradesActions.fetchDomains( selectedSite.ID );
		}
		this.prevSelectedSite = selectedSite;
	},

	handleStoreChange: function() {
		this.setState( { domainsStore: DomainsStore } );
	},

	switchSites: function( event ) {
		event.preventDefault();
		event.stopPropagation();
		layoutFocus.set( 'sites' );
		this.refs.site.closeActions();

		analytics.ga.recordEvent( 'Sidebar', 'Clicked Switch Site' );
	},

	getSelectedSite: function() {
		if ( this.props.sites.get().length === 1 ) {
			return this.props.sites.getPrimary();
		}

		return this.props.sites.getSelectedSite();
	},

	getSiteRedirectNotice: function( site ) {
		const isSiteRedirected = site.options && site.options.is_redirect;

		if ( ! isSiteRedirected ) {
			return null;
		}
		const { hostname } = url.parse( site.URL );
		let href = 'https://wordpress.com/my-domains';

		if ( config.isEnabled( 'upgrades/domain-management/list' ) ) {
			href = paths.domainManagementList( site.domain );
		}

		return (
			<Notice
				showDismiss={ false }
				isCompact={ true }
				text={ this.translate( 'Redirects to {{a}}%(url)s{{/a}}', {
					args: { url: hostname },
					components: { a: <a href={ site.URL }/> }
				} ) }>
				<NoticeAction href={ href }>
					{ this.translate( 'Edit' ) }
				</NoticeAction>
			</Notice>
		);
	},

	getDomainExpirationNotices: function() {
		let domainStore = this.state.domainsStore.getBySite( this.getSelectedSite().ID ),
			domains = domainStore && domainStore.list || [];
		return (
			<DomainWarnings
				selectedSite={ this.getSelectedSite() }
				domains={ domains }
				ruleWhiteList={ [ 'expiredDomains', 'expiringDomains' ] } />
		);
	},

	getSiteNotices: function( site ) {
		return (
			<div>
				{ this.getDomainExpirationNotices() }
				{ this.getSiteRedirectNotice( site ) }
			</div>
		);
	},

	focusContent: function() {
		layoutFocus.set( 'content' );
	},

	addNewWordPressButton: function() {
		return (
			<span className="current-site__add-new-site">
				<Button compact borderless
					href={ config( 'signup_url' ) + '?ref=calypso-selector' }
					onClick={ this.focusContent }
				>
					<Gridicon icon="add-outline" /> { this.translate( 'Add New WordPress' ) }
				</Button>
			</span>
		);
	},

	trackHomepageClick: function() {
		analytics.ga.recordEvent( 'Sidebar', 'Clicked View Site' );
	},

	render: function() {
		var site,
			hasOneSite = this.props.siteCount === 1;

		if ( ! this.props.sites.initialized ) {
			return (
				<Card className="current-site is-loading">
					{ hasOneSite
						? this.addNewWordPressButton()
						: <span className="current-site__switch-sites">&nbsp;</span>
					}
					<div className="site">
						<a className="site__content">
							<div className="site-icon" />
							<div className="site__info">
								<span className="site__title">{ this.translate( 'Loading My Sites…' ) }</span>
							</div>
						</a>
					</div>
				</Card>
			);
		}

		if ( this.props.sites.selected ) {
			site = this.props.sites.getSelectedSite();
		} else {
			site = this.props.sites.getPrimary();
		}

		return (
			<Card className="current-site">
				{ hasOneSite
					? this.addNewWordPressButton()
					: <span className="current-site__switch-sites">
						<Button compact borderless onClick={ this.switchSites }>
							<Gridicon icon="arrow-left" size={ 16 } />
							{ this.translate( 'Switch Site' ) }
						</Button>
					</span>
				}
				{ this.props.sites.selected
					? <Site
						site={ site }
						homeLink={ true }
						enableActions={ true }
						externalLink={ true }
						onSelect={ this.trackHomepageClick }
						ref="site" />
					: <AllSites sites={ this.props.sites } />
				}
				{ this.getSiteNotices( site ) }
			</Card>
		);
	}
} );
