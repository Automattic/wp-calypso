/**
 * External dependencies
 */
import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import FormattedHeader from 'components/formatted-header';
import { getSelectedSiteId } from 'state/ui/selectors';
import QuerySitePurchases from 'components/data/query-site-purchases';

class PlansFeaturesMainProductsHeader extends Component {
	static propTypes = {
		// Connected props
		siteId: PropTypes.number,

		// From localize() HoC
		translate: PropTypes.func.isRequired,
	};

	getSubHeader() {
		const { translate } = this.props;

		return (
			<Fragment>{ translate( "Looking for specific features? We've got you covered." ) }</Fragment>
		);
	}

	render() {
		const { siteId, translate } = this.props;

		return (
			<Fragment>
				<QuerySitePurchases siteId={ siteId } />
				<FormattedHeader
					headerText={ translate( 'Solutions' ) }
					subHeaderText={ this.getSubHeader() }
					compactOnMobile
					isSecondary
				/>
			</Fragment>
		);
	}
}

export default connect( ( state ) => {
	const siteId = getSelectedSiteId( state );

	return {
		siteId,
	};
} )( localize( PlansFeaturesMainProductsHeader ) );
