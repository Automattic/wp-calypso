/**
 * External dependencies
 */
import { useEffect } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import { isSingleUserSite, isJetpackSite } from 'state/sites/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import isSiteAutomatedTransfer from 'state/selectors/is-site-automated-transfer';
import isSiteStore from 'state/selectors/is-site-store';
import { stopNavigation } from '../api';

const PerformanceTrackerStop = ( { single, at, jetpack, store } ) => {
	useEffect( () => {
		stopNavigation( {
			metadata: {
				single,
				at,
				jetpack,
				store,
			},
		} );
	} );

	// Nothing to render, this component is all about side effects
	return null;
};

PerformanceTrackerStop.propTypes = {
	// Indicates if the site is a Single site
	single: PropTypes.bool,

	// Indicates if the site is Atomic
	at: PropTypes.bool,

	// Indicates if the site has Jetpack
	jetpack: PropTypes.bool,

	// Indicates if the site has WooCommerce
	store: PropTypes.bool,
};

const mapStateToProps = ( state ) => {
	const siteId = getSelectedSiteId( state );

	return {
		single: isSingleUserSite( state, siteId ),
		at: isSiteAutomatedTransfer( state, siteId ),
		jetpack: isJetpackSite( state, siteId ),
		store: isSiteStore( state, siteId ),
	};
};

export default connect( mapStateToProps )( PerformanceTrackerStop );
