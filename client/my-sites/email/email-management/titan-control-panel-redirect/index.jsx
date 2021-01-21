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
import EmptyContent from 'calypso/components/empty-content';
import { fetchTitanAutoLoginURL } from 'calypso/my-sites/email/email-management/titan-functions';
import { getTitanMailOrderId, hasTitanMailWithUs } from 'calypso/lib/titan';
import { getSelectedDomain } from 'calypso/lib/domains';
import { getDomainsBySiteId, isRequestingSiteDomains } from 'calypso/state/sites/domains/selectors';
import getSiteBySlug from 'calypso/state/sites/selectors/get-site-by-slug';
import QuerySiteDomains from 'calypso/components/data/query-site-domains';
import QuerySites from 'calypso/components/data/query-sites';

/**
 * Style and image dependencies
 */
import './style.scss';
import titanFullLogo from 'calypso/assets/images/email-providers/titan-full.svg';

class TitanControlPanelRedirect extends React.Component {
	static propTypes = {
		domain: PropTypes.object,
		domainName: PropTypes.string.isRequired,
		siteId: PropTypes.number,
		siteSlug: PropTypes.string.isRequired,
	};

	componentDidUpdate( prevProps ) {
		const { domain, isFetchingSiteDomains, translate } = this.props;

		// Make sure we fetch the redirect after we've finished fetching site domains
		if ( prevProps.isFetchingSiteDomains && ! isFetchingSiteDomains ) {
			if ( domain && hasTitanMailWithUs( domain ) ) {
				fetchTitanAutoLoginURL( getTitanMailOrderId( domain ) ).then( ( { error, loginURL } ) => {
					if ( error ) {
						this.props.errorNotice(
							error ?? translate( 'An unknown error occurred. Please try again later.' )
						);
					} else {
						window.location = loginURL;
					}
				} );
			}
		}
	}

	render() {
		const { siteId, translate } = this.props;

		return (
			<div className="titan-control-panel-redirect__main">
				<QuerySites allSites />
				{ siteId && <QuerySiteDomains siteId={ siteId } /> }
				<EmptyContent illustration={ titanFullLogo } title={ translate( 'Redirecting…' ) } />
			</div>
		);
	}
}

export default connect( ( state, ownProps ) => {
	const site = getSiteBySlug( state, ownProps.siteSlug );
	const siteId = site?.ID;
	const siteDomains = getDomainsBySiteId( state, siteId );
	return {
		domain: getSelectedDomain( {
			domains: siteDomains,
			selectedDomainName: ownProps.domainName,
			isSiteRedirect: false,
		} ),
		isFetchingSiteDomains: isRequestingSiteDomains( state, siteId ),
		siteId,
	};
} )( localize( TitanControlPanelRedirect ) );
