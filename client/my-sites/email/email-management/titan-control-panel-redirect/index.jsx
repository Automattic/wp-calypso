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
import { Card } from '@automattic/components';
import EmptyContent from 'calypso/components/empty-content';
import { fetchTitanAutoLoginURL } from 'calypso/my-sites/email/email-management/titan-functions';
import { getTitanMailOrderId, hasTitanMailWithUs } from 'calypso/lib/titan';
import { getSelectedDomain } from 'calypso/lib/domains';
import { getDomainsBySiteId } from 'calypso/state/sites/domains/selectors';
import getSiteBySlug from 'calypso/state/sites/selectors/get-site-by-slug';
import QuerySiteDomains from 'calypso/components/data/query-site-domains';
import QuerySites from 'calypso/components/data/query-sites';
import Spinner from 'calypso/components/spinner';

/**
 * Style and image dependencies
 */
import './style.scss';
import poweredByTitanLogo from 'calypso/assets/images/email-providers/titan/powered-by-titan.svg';

class TitanControlPanelRedirect extends React.Component {
	static propTypes = {
		// Props
		domainName: PropTypes.string.isRequired,
		siteSlug: PropTypes.string.isRequired,

		// Connected props derived from the props above
		domain: PropTypes.object,
		siteId: PropTypes.number,
	};

	componentDidMount() {
		this._fetchTriggered = false;
	}

	componentDidUpdate() {
		const { domain } = this.props;

		// Make sure we fetch the redirect after we have the domain in hand
		// fetchAndLoadControlPanelUrl() includes a check to navigate only once
		if ( domain && hasTitanMailWithUs( domain ) ) {
			this.fetchAndLoadControlPanelUrl();
		}
	}

	fetchAndLoadControlPanelUrl() {
		// Protect against making multiple network requests
		if ( this._fetchTriggered ) {
			return;
		}

		this._fetchTriggered = true;
		const { domain, translate } = this.props;

		fetchTitanAutoLoginURL( getTitanMailOrderId( domain ) ).then( ( { error, loginURL } ) => {
			if ( error ) {
				this._fetchTriggered = false;
				this.props.errorNotice(
					error ?? translate( 'An unknown error occurred. Please try again later.' )
				);
			} else {
				window.location = loginURL;
			}
		} );
	}

	render() {
		const { siteId, translate } = this.props;

		return (
			<div className="titan-control-panel-redirect__main">
				<QuerySites allSites />
				{ siteId && <QuerySiteDomains siteId={ siteId } /> }
				<EmptyContent illustration="" title="">
					<Card>
						<Spinner size={ 40 } />
						<h1>{ translate( 'Redirecting you to your Email Control Panel' ) }</h1>
						<hr />
						<img src={ poweredByTitanLogo } alt={ translate( 'Powered by Titan' ) } />
					</Card>
				</EmptyContent>
			</div>
		);
	}
}

export default connect( ( state, ownProps ) => {
	const site = getSiteBySlug( state, ownProps.siteSlug );
	const siteId = site?.ID;
	return {
		domain: getSelectedDomain( {
			domains: getDomainsBySiteId( state, siteId ),
			selectedDomainName: ownProps.domainName,
			isSiteRedirect: false,
		} ),
		siteId,
	};
} )( localize( TitanControlPanelRedirect ) );
