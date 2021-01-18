/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import AsyncLoad from 'calypso/components/async-load';
import QuerySitePurchases from 'calypso/components/data/query-site-purchases';
import QuerySiteSettings from 'calypso/components/data/query-site-settings';
import { errorNotice } from 'calypso/state/notices/actions';
import {
	getSitePurchases,
	hasLoadedSitePurchasesFromServer,
	getPurchasesError,
} from 'calypso/state/purchases/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

export class SeoSettings extends Component {
	UNSAFE_componentWillReceiveProps( nextProps ) {
		if ( ! this.props.purchasesError && nextProps.purchasesError ) {
			this.props.errorNotice( nextProps.purchasesError );
		}
	}

	render() {
		const { siteId } = this.props;

		return (
			<div>
				<QuerySiteSettings siteId={ siteId } />
				<QuerySitePurchases siteId={ siteId } />
				<AsyncLoad
					require="calypso/my-sites/site-settings/seo-settings/form"
					placeholder={ null }
				/>
			</div>
		);
	}
}

SeoSettings.propTypes = {
	section: PropTypes.string,
	//connected
	hasLoadedSitePurchasesFromServer: PropTypes.bool,
	purchasesError: PropTypes.string,
	sitePurchases: PropTypes.array,
	siteId: PropTypes.number,
};

export default connect(
	( state ) => {
		const siteId = getSelectedSiteId( state );
		return {
			siteId,
			hasLoadedSitePurchasesFromServer: hasLoadedSitePurchasesFromServer( state ),
			purchasesError: getPurchasesError( state ),
			sitePurchases: getSitePurchases( state, siteId ),
		};
	},
	{
		errorNotice,
	}
)( SeoSettings );
