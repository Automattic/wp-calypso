/**
 * External dependencies
 */
import { connect } from 'react-redux';
import debugFactory from 'debug';
import { get } from 'lodash';
import { localize } from 'i18n-calypso';
import React from 'react';

const debug = debugFactory( 'calypso:my-sites:current-site' );

/**
 * Internal dependencies
 */
const AllSites = require( 'my-sites/all-sites' ),
	analytics = require( 'lib/analytics' ),
	Button = require( 'components/button' ),
	Card = require( 'components/card' ),
	Site = require( 'blocks/site' ),
	Gridicon = require( 'gridicons' ),
	UpgradesActions = require( 'lib/upgrades/actions' ),
	DomainsStore = require( 'lib/domains/store' ),
	DomainWarnings = require( 'my-sites/upgrades/components/domain-warnings' );

import SiteNotice from './notice';
import { setLayoutFocus } from 'state/ui/layout-focus/actions';
import { getSelectedSite, getSelectedSiteId } from 'state/ui/selectors';
import { getCurrentUser } from 'state/current-user/selectors';
import { isJetpackSite } from 'state/sites/selectors';

const CurrentSite = React.createClass( {
	displayName: 'CurrentSite',

	componentDidMount: function() {
		debug( 'The current site React component is mounted.' );
	},

	propTypes: {
		isJetpack: React.PropTypes.bool,
		siteCount: React.PropTypes.number.isRequired,
		sites: React.PropTypes.object.isRequired,
		setLayoutFocus: React.PropTypes.func.isRequired,
		selectedSiteId: React.PropTypes.number,
		selectedSite: React.PropTypes.object,
		translate: React.PropTypes.func.isRequired
	},

	componentWillMount() {
		const { selectedSiteId, isJetpack } = this.props;
		if ( selectedSiteId && ! isJetpack ) {
			UpgradesActions.fetchDomains( selectedSiteId );
		}

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

	componentDidUpdate( prevProps ) {
		const { selectedSiteId, isJetpack } = this.props;
		if ( selectedSiteId && ! isJetpack && selectedSiteId !== prevProps.selectedSiteId ) {
			UpgradesActions.fetchDomains( selectedSiteId );
		}
	},

	handleStoreChange: function() {
		this.setState( { domainsStore: DomainsStore } );
	},

	switchSites: function( event ) {
		event.preventDefault();
		event.stopPropagation();
		this.props.setLayoutFocus( 'sites' );

		analytics.ga.recordEvent( 'Sidebar', 'Clicked Switch Site' );
	},

	getDomainWarnings: function() {
		const { selectedSiteId, selectedSite: site } = this.props;

		if ( ! selectedSiteId ) {
			return null;
		}

		const domainStore = this.state.domainsStore.getBySite( selectedSiteId );
		const domains = domainStore && domainStore.list || [];

		return (
			<DomainWarnings
				isCompact
				selectedSite={ site }
				domains={ domains }
				ruleWhiteList={ [
					'unverifiedDomainsCanManage',
					'unverifiedDomainsCannotManage',
					'expiredDomainsCanManage',
					'expiringDomainsCanManage',
					'expiredDomainsCannotManage',
					'expiringDomainsCannotManage',
					'wrongNSMappedDomains',
					'pendingGappsTosAcceptanceDomains'
				] }
			/>
		);
	},

	previewSite: function( event ) {
		analytics.ga.recordEvent( 'Sidebar', 'Clicked View Site' );
		this.props.onClick && this.props.onClick( event );
	},

	render: function() {
		const { isJetpack, selectedSite, translate } = this.props;

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
								<span className="site__title">{ translate( 'Loading My Sites…' ) }</span>
							</div>
						</a>
					</div>
				</Card>
			);
		}

		return (
			<Card className="current-site">
				{ this.props.siteCount > 1 &&
					<span className="current-site__switch-sites">
						<Button compact borderless onClick={ this.switchSites }>
							<Gridicon icon="arrow-left" size={ 18 } />
							{ translate( 'Switch Site' ) }
						</Button>
					</span>
				}
				{ selectedSite
					? <Site
						site={ selectedSite }
						homeLink={ true }
						externalLink={ true }
						onSelect={ this.previewSite }
						tipTarget="site-card-preview" />
					: <AllSites sites={ this.props.sites.get() } />
				}
				{ ! isJetpack && this.getDomainWarnings() }
				<SiteNotice site={ selectedSite } />
			</Card>
		);
	}
} );

// TODO: make this pure when sites can be retrieved from the Redux state
module.exports = connect(
	( state ) => {
		const selectedSiteId = getSelectedSiteId( state ),
			user = getCurrentUser( state );

		return {
			isJetpack: isJetpackSite( state, selectedSiteId ),
			selectedSiteId,
			selectedSite: getSelectedSite( state ),
			siteCount: get( user, 'visible_site_count', 0 )
		};
	},
	{ setLayoutFocus },
	null,
	{ pure: false }
)( localize( CurrentSite ) );
