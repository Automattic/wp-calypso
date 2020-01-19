/**
 * External dependencies
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { getSelectedSiteWithFallback } from 'woocommerce/state/sites/selectors';
import { ProgressBar } from '@automattic/components';
import SetupHeader from './setup/header';
import { setUpStorePages } from 'woocommerce/state/sites/setup-choices/actions';

class RequiredPagesSetupView extends Component {
	static propTypes = {
		setUpStorePages: PropTypes.func.isRequired,
		site: PropTypes.shape( {
			ID: PropTypes.number.isRequired,
		} ),
	};

	componentDidMount = () => {
		const { site } = this.props;
		if ( site ) {
			this.props.setUpStorePages( site.ID );
		}
	};

	render = () => {
		const { translate } = this.props;
		return (
			<div className="card dashboard__setup-wrapper setup__wrapper">
				<SetupHeader
					imageSource={ '/calypso/images/extensions/woocommerce/woocommerce-store-creation.svg' }
					imageWidth={ 160 }
					title={ translate( 'Building your store' ) }
					subtitle={ translate( "Give us a minute and we'll move right along." ) }
				>
					<ProgressBar value={ 100 } isPulsing />
				</SetupHeader>
			</div>
		);
	};
}

function mapStateToProps( state ) {
	const site = getSelectedSiteWithFallback( state );
	return {
		site,
	};
}

function mapDispatchToProps( dispatch ) {
	return bindActionCreators(
		{
			setUpStorePages,
		},
		dispatch
	);
}

export default connect( mapStateToProps, mapDispatchToProps )( localize( RequiredPagesSetupView ) );
