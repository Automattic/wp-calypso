/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import { some, forEach, isEqual, without } from 'lodash';

/**
 * Internal dependencies
 */
import { isRequestingSites, isRequestingSite, hasAllSitesList } from 'state/sites/selectors';
import { requestSites, requestSite } from 'state/sites/actions';
import { getPreference } from 'state/preferences/selectors';
import getPrimarySiteId from 'state/selectors/get-primary-site-id';

class QuerySites extends Component {
	UNSAFE_componentWillMount() {
		this.requestAll( this.props );
		this.requestPrimary( this.props );
		this.requestRecent( this.props );
		this.requestSingle( this.props );
	}

	UNSAFE_componentWillReceiveProps( nextProps ) {
		if ( nextProps.siteId !== this.props.siteId ) {
			this.requestSingle( nextProps );
		}

		if ( nextProps.primaryAndRecent && nextProps.primarySiteId !== this.props.primarySiteId ) {
			this.requestPrimary( nextProps );
		}

		if (
			nextProps.primaryAndRecent &&
			! isEqual( nextProps.recentSiteIds, this.props.recentSiteIds )
		) {
			this.requestRecent( nextProps );
		}
	}

	requestAll( props ) {
		if ( props.allSites && ! props.requestingSites ) {
			props.requestSites();
		}
	}

	requestPrimary( props ) {
		if ( props.primaryAndRecent && ! props.hasAllSitesList ) {
			const { primarySiteId, isRequestingPrimarySite } = props;

			if ( primarySiteId && ! isRequestingPrimarySite ) {
				props.requestSite( primarySiteId );
			}
		}
	}

	requestRecent( props ) {
		if ( props.primaryAndRecent && ! props.hasAllSitesList ) {
			const { recentSiteIds, isRequestingRecentSites, primarySiteId } = props;

			if ( recentSiteIds && recentSiteIds.length && ! isRequestingRecentSites ) {
				forEach( without( recentSiteIds, primarySiteId ), props.requestSite );
			}
		}
	}

	requestSingle( props ) {
		if ( props.siteId && ! props.requestingSite ) {
			props.requestSite( props.siteId );
		}
	}

	render() {
		return null;
	}
}

QuerySites.propTypes = {
	allSites: PropTypes.bool,
	primaryAndRecent: PropTypes.bool,
	siteId: PropTypes.oneOfType( [
		PropTypes.number,
		// The actions and selectors we use also work with site slugs. Needed by jetpack-onboarding/main.
		PropTypes.string,
	] ),
	requestingSites: PropTypes.bool,
	requestingSite: PropTypes.bool,
	requestSites: PropTypes.func,
	requestSite: PropTypes.func,
};

QuerySites.defaultProps = {
	allSites: false,
	primaryAndRecent: false,
	requestSites: () => {},
	requestSite: () => {},
};

export default connect(
	( state, { siteId } ) => {
		const primarySiteId = getPrimarySiteId( state );
		const recentSiteIds = getPreference( state, 'recentSites' );
		const recentSiteIdsWithoutPrimary = without(
			getPreference( state, 'recentSites' ),
			primarySiteId
		);

		return {
			primarySiteId,
			recentSiteIds,
			hasAllSitesList: hasAllSitesList( state ),
			requestingSites: isRequestingSites( state ),
			requestingSite: isRequestingSite( state, siteId ),
			isRequestingPrimarySite: isRequestingSite( state, primarySiteId ),
			// eslint-disable-next-line wpcalypso/redux-no-bound-selectors
			isRequestingRecentSites: some( recentSiteIdsWithoutPrimary, id =>
				isRequestingSite( state, id )
			),
		};
	},
	{ requestSites, requestSite }
)( QuerySites );
