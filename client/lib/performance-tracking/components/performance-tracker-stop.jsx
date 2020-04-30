/**
 * External dependencies
 */
import React from 'react';
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

class PerformanceTrackerStop extends React.Component {
	static propTypes = {
		// Indicates if the site is a Single site
		single: PropTypes.bool,

		// Indicates if the site is Atomic
		at: PropTypes.bool,

		// Indicates if the site has Jetpack
		jetpack: PropTypes.bool,

		// Indicates if the site has WooCommerce
		store: PropTypes.bool,
	};

	componentDidMount() {
		stopNavigation( {
			metadata: {
				single: this.props.single,
				at: this.props.at,
				jetpack: this.props.jetpack,
				store: this.props.store,
			},
		} );
	}

	render() {
		return null;
	}
}

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
