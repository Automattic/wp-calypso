/** @format */

/**
 * External dependencies
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import page from 'page';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import {
	areSetupChoicesLoading,
	getFinishedInitialSetup,
} from 'woocommerce/state/sites/setup-choices/selectors';
import { getLink } from 'woocommerce/lib/nav-utils';
import { getSelectedSiteWithFallback } from 'woocommerce/state/sites/selectors';
import { createWcsShippingSaveActionList } from 'woocommerce/woocommerce-services/state/actions';
import { successNotice, errorNotice } from 'state/notices/actions';
import { getActionList } from 'woocommerce/state/action-list/selectors';
import { saveWeightAndDimensionsUnits } from 'woocommerce/state/sites/settings/products/actions';
import { isWcsEnabled } from 'woocommerce/state/selectors/plugins';

class ShippingSettingsSaveButton extends Component {
	static propTypes = {
		onSaveSuccess: PropTypes.func.isRequired,
	};

	onSaveSuccess = dispatch => {
		const { translate } = this.props;

		this.props.onSaveSuccess();

		dispatch(
			successNotice( translate( 'Shipping settings saved' ), {
				duration: 4000,
			} )
		);
	};

	save = () => {
		const { translate, wcsEnabled, site } = this.props;
		if ( ! wcsEnabled ) {
			return;
		}
		const failureAction = errorNotice(
			translate( 'There was a problem saving the shipping settings. Please try again.' )
		);

		const noLabelsPaymentAction = errorNotice(
			translate( 'A payment method is required to print shipping labels.' ),
			{
				duration: 4000,
			}
		);

		const unitsSaveSuccessNotice = successNotice( translate( 'Units settings saved' ), {
			duration: 4000,
		} );

		const unitsSaveFailureNotice = errorNotice(
			translate( 'There was a problem saving units settings. Please try again.' )
		);

		this.props.saveWeightAndDimensionsUnits(
			site.ID,
			unitsSaveSuccessNotice,
			unitsSaveFailureNotice
		);

		this.props.createWcsShippingSaveActionList(
			this.onSaveSuccess,
			failureAction,
			noLabelsPaymentAction
		);
	};

	redirect = () => {
		const { site } = this.props;
		this.save();
		page.redirect( getLink( '/store/:site', site ) );
	};

	render() {
		const { wcsEnabled, translate, loading, site, finishedInitialSetup, isSaving } = this.props;

		if ( loading || ! site ) {
			return null;
		}

		if ( finishedInitialSetup ) {
			return wcsEnabled ? (
				<Button onClick={ this.save } primary busy={ isSaving } disabled={ isSaving }>
					{ translate( 'Save' ) }
				</Button>
			) : null;
		}
		const label = wcsEnabled ? translate( 'Save & finish' ) : translate( "I'm Finished" );
		return (
			<Button onClick={ this.redirect } primary busy={ isSaving } disabled={ isSaving }>
				{ label }
			</Button>
		);
	}
}

function mapStateToProps( state ) {
	const site = getSelectedSiteWithFallback( state );
	const wcsEnabled = isWcsEnabled( state, site.ID );
	const loading = areSetupChoicesLoading( state );
	const finishedInitialSetup = getFinishedInitialSetup( state );
	return {
		site,
		wcsEnabled,
		finishedInitialSetup,
		loading,
		isSaving: Boolean( getActionList( state ) ),
	};
}

function mapDispatchToProps( dispatch ) {
	return bindActionCreators(
		{
			createWcsShippingSaveActionList,
			saveWeightAndDimensionsUnits,
		},
		dispatch
	);
}

export default connect( mapStateToProps, mapDispatchToProps )(
	localize( ShippingSettingsSaveButton )
);
