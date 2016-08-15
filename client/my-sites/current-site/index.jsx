/**
 * External dependencies
 */
import React from 'react';
import debugFactory from 'debug';
import { connect } from 'react-redux';

const debug = debugFactory( 'calypso:my-sites:current-site' );

/**
 * Internal dependencies
 */
var AllSites = require( 'my-sites/all-sites' ),
	analytics = require( 'lib/analytics' ),
	Button = require( 'components/button' ),
	Card = require( 'components/card' ),
	Site = require( 'blocks/site' ),
	Gridicon = require( 'components/gridicon' ),
	UpgradesActions = require( 'lib/upgrades/actions' ),
	DomainsStore = require( 'lib/domains/store' ),
	DomainWarnings = require( 'my-sites/upgrades/components/domain-warnings' );

import SiteNotice from './notice';
import { setLayoutFocus } from 'state/ui/layout-focus/actions';

const CurrentSite = React.createClass( {
	displayName: 'CurrentSite',

	componentDidMount: function() {
		debug( 'The current site React component is mounted.' );
	},

	propTypes: {
		sites: React.PropTypes.object.isRequired,
		siteCount: React.PropTypes.number.isRequired,
		setLayoutFocus: React.PropTypes.func.isRequired,
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
		this.props.setLayoutFocus( 'sites' );
		if ( this.refs.site ) {
			this.refs.site.closeActions();
		}

		analytics.ga.recordEvent( 'Sidebar', 'Clicked Switch Site' );
	},

	getSelectedSite: function() {
		if ( this.props.sites.get().length === 1 ) {
			return this.props.sites.getPrimary();
		}

		return this.props.sites.getSelectedSite();
	},

	getDomainWarnings: function() {
		let domainStore = this.state.domainsStore.getBySite( this.getSelectedSite().ID ),
			domains = domainStore && domainStore.list || [];
		return (
			<DomainWarnings
				isCompact
				selectedSite={ this.getSelectedSite() }
				domains={ domains }
				ruleWhiteList={ [ 'unverifiedDomains', 'expiredDomains', 'expiringDomains', 'wrongNSMappedDomains' ] } />
		);
	},

	getSiteNotices: function() {
		return (
			<div>
				{ this.getDomainWarnings() }
			</div>
		);
	},

	previewSite: function( event ) {
		analytics.ga.recordEvent( 'Sidebar', 'Clicked View Site' );
		this.props.onClick && this.props.onClick( event );
	},

	render: function() {
		let site;

		if ( ! this.props.sites.initialized ) {
			return (
				<Card className="current-site is-loading">
					{ this.props.siteCount > 1 &&
						<span className="current-site__switch-sites">&nbsp;</span>
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
				{ this.props.siteCount > 1 &&
					<span className="current-site__switch-sites">
						<Button compact borderless onClick={ this.switchSites }>
							<Gridicon icon="arrow-left" size={ 18 } />
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
						onClick={ this.previewSite }
						onSelect={ this.previewSite }
						tipTarget="site-card-preview"
						ref="site" />
					: <AllSites sites={ this.props.sites.get() } />
				}
				{ this.getSiteNotices( site ) }
				<SiteNotice site={ site } />
			</Card>
		);
	}
} );

// TODO: make this pure when sites can be retrieved from the Redux state
module.exports = connect( null, { setLayoutFocus }, null, { pure: false } )( CurrentSite );
