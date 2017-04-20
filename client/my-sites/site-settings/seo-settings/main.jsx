/**
 * External dependencies
 */
import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import notices from 'notices';
import QuerySitePurchases from 'components/data/query-site-purchases';
import QuerySiteSettings from 'components/data/query-site-settings';
import { getSitePurchases, hasLoadedSitePurchasesFromServer, getPurchasesError } from 'state/purchases/selectors';
import { getSelectedSiteId, getSelectedSite } from 'state/ui/selectors';
import SeoForm from './form';

export class SeoSettings extends Component {

	componentWillReceiveProps( nextProps ) {
		if ( nextProps.purchasesError ) {
			notices.error( nextProps.purchasesError );
		}
	}

	render() {
		const { site, siteId, upgradeToBusiness } = this.props;

		return (
			<div>
				<QuerySiteSettings siteId={ siteId } />
				<QuerySitePurchases siteId={ siteId } />
				{ site && <SeoForm { ...{ site, upgradeToBusiness } } /> }
			</div>
		);
	}
}

SeoSettings.propTypes = {
	upgradeToBusiness: PropTypes.func,
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
