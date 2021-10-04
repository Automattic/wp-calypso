import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import QuerySitePurchases from 'calypso/components/data/query-site-purchases';
import FormattedHeader from 'calypso/components/formatted-header';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

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
