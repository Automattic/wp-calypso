/** @format */

/**
 * External dependencies
 */

import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { isEmpty } from 'lodash';
import { localize } from 'i18n-calypso';
import page from 'page';

import debugFactory from 'debug';
const debug = debugFactory( 'allendav' );

/**
 * Internal dependencies
 */
import config from 'config';
import Button from 'components/button';
import {
	areSetupChoicesLoading,
	getFinishedInitialSetup,
} from 'woocommerce/state/sites/setup-choices/selectors';
import { createWcsShippingSaveActionList } from 'woocommerce/woocommerce-services/state/actions';
import { fetchSetupChoices } from 'woocommerce/state/sites/setup-choices/actions';
import { getActionList } from 'woocommerce/state/action-list/selectors';
import { getLink } from 'woocommerce/lib/nav-utils';
import getSaveSettingsActionListSteps from 'woocommerce/state/data-layer/ui/woocommerce-services/reducer';
import { getSelectedSiteWithFallback } from 'woocommerce/state/sites/selectors';
import { ProtectFormGuard } from 'lib/protect-form';
import { successNotice, errorNotice } from 'state/notices/actions';

class ShippingSettingsSaveButton extends Component {
	componentDidMount = () => {
		const { site } = this.props;

		if ( site && site.ID ) {
			this.props.fetchSetupChoices( site.ID );
		}
	};

	componentWillReceiveProps = newProps => {
		const { site } = this.props;

		const newSiteId = newProps.site ? newProps.site.ID : null;
		const oldSiteId = site ? site.ID : null;

		if ( oldSiteId !== newSiteId ) {
			this.props.fetchSetupChoices( newSiteId );
		}
	};

	save = () => {
		if ( ! config.isEnabled( 'woocommerce/extension-wcservices' ) ) {
			return;
		}

		const { translate } = this.props;

		const successAction = successNotice( translate( 'Shipping settings saved' ), {
			duration: 4000,
		} );

		const failureAction = errorNotice(
			translate( 'There was a problem saving the shipping settings. Please try again.' )
		);

		const noLabelsPaymentAction = errorNotice(
			translate( 'A payment method is required to print shipping labels.' ),
			{
				duration: 4000,
			}
		);

		this.props.createWcsShippingSaveActionList(
			successAction,
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
		const { hasEdits, finishedInitialSetup, isSaving, loading, site, translate } = this.props;
		const wcsEnabled = config.isEnabled( 'woocommerce/extension-wcservices' );

		if ( loading || ! site ) {
			return null;
		}

		if ( finishedInitialSetup && ! wcsEnabled ) {
			return null;
		}

		const clickHandler = finishedInitialSetup ? this.save : this.redirect;
		let label = translate( 'Save' );
		if ( ! finishedInitialSetup ) {
			label = wcsEnabled ? translate( 'Save and finish' ) : translate( "I'm Finished" );
		}

		return (
			<div>
				<Button onClick={ clickHandler } primary busy={ isSaving } disabled={ isSaving }>
					{ label }
				</Button>
				<ProtectFormGuard isChanged={ hasEdits } />
			</div>
		);
	}
}

function mapStateToProps( state ) {
	const foo = getSaveSettingsActionListSteps( state );
	debug( 'getSaveSettingsActionListSteps=', foo );
	// TODO FIX ALLENDAV MON NOV 27 - LOOKS LIKE CANCELLING A PACKAGE FAILS TO REMOVE THE ACTIONS FROM THE UI EDIT LIST
	// SAME THING FOR CHANGING THE LABEL SIZE AND THEN CHANGING IT BACK

	const site = getSelectedSiteWithFallback( state );
	const hasEdits = ! isEmpty( getSaveSettingsActionListSteps( state ) );
	const loading = areSetupChoicesLoading( state );
	const finishedInitialSetup = getFinishedInitialSetup( state );
	return {
		hasEdits,
		finishedInitialSetup,
		isSaving: Boolean( getActionList( state ) ),
		loading,
		site,
	};
}

function mapDispatchToProps( dispatch ) {
	return bindActionCreators(
		{
			fetchSetupChoices,
			createWcsShippingSaveActionList,
		},
		dispatch
	);
}

export default connect( mapStateToProps, mapDispatchToProps )(
	localize( ShippingSettingsSaveButton )
);
