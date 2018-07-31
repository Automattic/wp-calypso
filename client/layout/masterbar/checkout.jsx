/** @format */
/**
 * External dependencies
 */
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React from 'react';

/**
 * Internal dependencies
 */
import { recordTracksEvent } from 'state/analytics/actions';
import Masterbar from './masterbar';
import Item from './item';
import config from 'config';
import { preload } from 'sections-helper';
import getPrimarySiteId from 'state/selectors/get-primary-site-id';
import isDomainOnlySite from 'state/selectors/is-domain-only-site';
import { setNextLayoutFocus } from 'state/ui/layout-focus/actions';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getSiteSlug } from 'state/sites/selectors';
import { getStatsPathForTab } from 'lib/route';
import { domainManagementList } from 'my-sites/domains/paths';

class MasterbarCheckout extends React.Component {
	static propTypes = {
		domainOnlySite: PropTypes.bool,
		user: PropTypes.object,
		section: PropTypes.oneOfType( [ PropTypes.string, PropTypes.bool ] ),
		setNextLayoutFocus: PropTypes.func.isRequired,
		siteSlug: PropTypes.string,
	};

	clickMySites = () => {
		this.props.recordTracksEvent( 'calypso_masterbar_my_sites_clicked' );
		this.props.setNextLayoutFocus( 'sidebar' );
	};

	preloadMySites = () => {
		preload( this.props.domainOnlySite ? 'domains' : 'stats' );
	};

	wordpressIcon = () => {
		// WP icon replacement for "horizon" environment
		if ( config( 'hostname' ) === 'horizon.wordpress.com' ) {
			return 'my-sites-horizon';
		}

		return 'my-sites';
	};

	render() {
		const { domainOnlySite, siteSlug, translate } = this.props,
			mySitesUrl = domainOnlySite
				? domainManagementList( siteSlug )
				: getStatsPathForTab( 'day', siteSlug );

		return (
			<Masterbar>
				<Item
					url={ mySitesUrl }
					tipTarget="my-sites"
					icon={ this.wordpressIcon() }
					onClick={ this.clickMySites }
					tooltip={ translate( 'View a list of your sites and access their dashboards' ) }
					preloadSection={ this.preloadMySites }
				>
					{ this.props.user.get().site_count > 1
						? translate( 'My Sites', { comment: 'Toolbar, must be shorter than ~12 chars' } )
						: translate( 'My Site', { comment: 'Toolbar, must be shorter than ~12 chars' } ) }
				</Item>
			</Masterbar>
		);
	}
}

export default connect(
	state => {
		// Falls back to using the user's primary site if no site has been selected
		// by the user yet
		const siteId = getSelectedSiteId( state ) || getPrimarySiteId( state );

		return {
			siteSlug: getSiteSlug( state, siteId ),
			domainOnlySite: isDomainOnlySite( state, siteId ),
		};
	},
	{ setNextLayoutFocus, recordTracksEvent }
)( localize( MasterbarCheckout ) );
