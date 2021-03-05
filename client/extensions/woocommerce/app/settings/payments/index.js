/**
 * External dependencies
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import page from 'page';

/**
 * Internal dependencies
 */
import ActionHeader from 'woocommerce/components/action-header';
import { Button } from '@automattic/components';
import { createPaymentSettingsActionList } from 'woocommerce/state/ui/payments/actions';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import ExtendedHeader from 'woocommerce/components/extended-header';
import { getActionList } from 'woocommerce/state/action-list/selectors';
import { getCurrencyEdits } from 'woocommerce/state/ui/payments/currency/selectors';
import { getFinishedInitialSetup } from 'woocommerce/state/sites/setup-choices/selectors';
import { getLink } from 'woocommerce/lib/nav-utils';
import { getPaymentMethodsEdits } from 'woocommerce/state/ui/payments/methods/selectors';
import { getSelectedSiteWithFallback } from 'woocommerce/state/sites/selectors';
import {
	hasOAuthParamsInLocation,
	hasOAuthCompleteInLocation,
} from './stripe/payment-method-stripe-utils';
import { openPaymentMethodForEdit } from 'woocommerce/state/ui/payments/methods/actions';
import { ProtectFormGuard } from 'calypso/lib/protect-form';
import Main from 'calypso/components/main';
import PaymentMethodList from './payment-method-list';
import SettingsPaymentsLocationCurrency from './payments-location-currency';
import SettingsNavigation from '../navigation';

class SettingsPayments extends Component {
	state = {
		pristine: true,
	};

	static propTypes = {
		isSaving: PropTypes.bool,
		site: PropTypes.shape( {
			slug: PropTypes.string,
			ID: PropTypes.number,
		} ),
		className: PropTypes.string,
	};

	componentDidMount = () => {
		const { site } = this.props;

		// If we are in the middle of the Stripe Connect OAuth flow
		// go ahead and option the Stripe dialog right away so
		// we can complete the flow
		if ( hasOAuthParamsInLocation() || hasOAuthCompleteInLocation() ) {
			this.props.openPaymentMethodForEdit( site.ID, 'stripe' );
		}
	};

	onSave = () => {
		const { translate, site, finishedInitialSetup } = this.props;
		const successAction = () => {
			this.setState( { pristine: true } );

			if ( ! finishedInitialSetup ) {
				page.redirect( getLink( '/store/:site', site ) );
			}

			return successNotice( translate( 'Payment settings saved.' ), {
				duration: 4000,
				displayOnNextPage: true,
			} );
		};

		const failureAction = errorNotice(
			translate( 'There was a problem saving the payment settings. Please try again.' )
		);

		this.props.createPaymentSettingsActionList( successAction, failureAction );
	};

	renderPaymentSection = ( { description, label, methodType } ) => (
		<div className="payments__type-container" key={ methodType }>
			<ExtendedHeader label={ label } description={ description } />
			<PaymentMethodList methodType={ methodType } onChange={ this.onChange } />
		</div>
	);

	renderPaymentSections = () => {
		const { translate } = this.props;

		const paymentSections = [
			{
				methodType: 'on-site',
				label: translate( 'On-site' ),
				description: translate(
					'Take credit card payments directly on your site, ' +
						'without redirecting customers to a third-party site.'
				),
			},
			{
				methodType: 'off-site',
				label: translate( 'Off-site' ),
				description: translate(
					'Take payments through a third-party site, like PayPal. ' +
						'Customers will leave your store to pay.'
				),
			},
			{
				methodType: 'offline',
				label: translate( 'Offline' ),
				description: translate( 'Take payments in-person.' ),
			},
		];

		return <div>{ paymentSections.map( this.renderPaymentSection ) }</div>;
	};

	onChange = () => {
		this.setState( { pristine: false } );
	};

	render() {
		const { isSaving, site, translate, className, finishedInitialSetup, hasEdits } = this.props;
		const saveDisabled = isSaving || ! hasEdits;

		const breadcrumbs = [
			<a href={ getLink( '/store/settings/:site/', site ) }>{ translate( 'Settings' ) }</a>,
			<span>{ translate( 'Payments' ) }</span>,
		];

		const saveMessage = finishedInitialSetup ? translate( 'Save' ) : translate( 'Save & Finish' );
		return (
			<Main className={ classNames( 'settingsPayments', className ) } wideLayout>
				<ActionHeader breadcrumbs={ breadcrumbs }>
					<Button primary onClick={ this.onSave } busy={ isSaving } disabled={ saveDisabled }>
						{ saveMessage }
					</Button>
				</ActionHeader>
				<SettingsNavigation activeSection="payments" />
				<SettingsPaymentsLocationCurrency onChange={ this.onChange } />
				{ this.renderPaymentSections() }
				<ProtectFormGuard isChanged={ ! this.state.pristine } />
			</Main>
		);
	}
}

function mapStateToProps( state ) {
	const site = getSelectedSiteWithFallback( state );
	const finishedInitialSetup = getFinishedInitialSetup( state );
	const edits = site && getPaymentMethodsEdits( state, site.ID );
	const currencyEdits = site && getCurrencyEdits( state, site.ID );
	const hasEdits =
		( edits && edits.updates && edits.updates.length > 0 ) ||
		( currencyEdits && currencyEdits.length > 0 ) ||
		false;

	return {
		isSaving: Boolean( getActionList( state ) ),
		site,
		finishedInitialSetup,
		hasEdits,
	};
}

function mapDispatchToProps( dispatch ) {
	return bindActionCreators(
		{
			createPaymentSettingsActionList,
			openPaymentMethodForEdit,
		},
		dispatch
	);
}

export default connect( mapStateToProps, mapDispatchToProps )( localize( SettingsPayments ) );
