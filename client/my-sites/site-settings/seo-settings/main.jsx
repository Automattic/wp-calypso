/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import SeoForm from './form';
import QuerySitePurchases from 'components/data/query-site-purchases';
import QuerySiteSettings from 'components/data/query-site-settings';
import notices from 'notices';
import { getSitePurchases, hasLoadedSitePurchasesFromServer, getPurchasesError } from 'state/purchases/selectors';
import { getSelectedSiteId, getSelectedSite } from 'state/ui/selectors';

export class SeoSettings extends Component {
	componentWillReceiveProps( nextProps ) {
		if ( nextProps.purchasesError ) {
			notices.error( nextProps.purchasesError );
		}
	}

	render() {
		const { site, siteId } = this.props;

		return (
			<div>
				<QuerySiteSettings siteId={ siteId } />
				<QuerySitePurchases siteId={ siteId } />
				{ site && <SeoForm site={ site } /> }
			</div>
		);
	}
}

SeoSettings.propTypes = {
	section: PropTypes.string,
	//connected
	hasLoadedSitePurchasesFromServer: PropTypes.bool,
	purchasesError: PropTypes.object,
	sitePurchases: PropTypes.array,
	site: PropTypes.object,
	siteId: PropTypes.number
};

export default connect(
	( state ) => {
		const siteId = getSelectedSiteId( state );
		return {
			siteId,
			site: getSelectedSite( state ),
			hasLoadedSitePurchasesFromServer: hasLoadedSitePurchasesFromServer( state ),
			purchasesError: getPurchasesError( state ),
			sitePurchases: getSitePurchases( state, siteId )
		};
	}
)( SeoSettings );
