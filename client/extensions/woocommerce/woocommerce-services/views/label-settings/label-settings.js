/** @format */

/**
 * External dependencies
 */

import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import { isBoolean } from 'lodash';

/**
 * Internal dependencies
 */
import { getPaperSizes } from 'woocommerce/woocommerce-services/lib/pdf-label-utils';
import FormCheckbox from 'components/forms/form-checkbox';
import FormFieldSet from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormSelect from 'components/forms/form-select';
import Notice from 'components/notice';
import PaymentSetting from './label-payment-setting';
import {
	areSettingsFetching,
	areSettingsLoaded,
	getEmailReceipts,
	getLabelSettingsStoreOptions,
	getMasterUserInfo,
	getPaperSize,
	userCanEditSettings,
	userCanManagePayments,
} from 'woocommerce/woocommerce-services/state/label-settings/selectors';

class ShippingLabels extends Component {
	renderPlaceholder() {
		return (
			<div className="label-settings__placeholder">
				<FormFieldSet>
					<FormLabel className="label-settings__cards-label">
						<span />
					</FormLabel>
					<FormSelect />
				</FormFieldSet>
				<FormFieldSet>
					<FormLabel className="label-settings__cards-label">
						<span />
					</FormLabel>
					<PaymentSetting isLoading={ true } />
				</FormFieldSet>
			</div>
		);
	}

	renderPaymentPermissionNotice = () => {
		const {
			canEditPayments,
			canEditSettings,
			masterUserName,
			masterUserLogin,
			translate,
		} = this.props;

		// If the user can's edit any settings, there will be another notice for the whole section
		if ( ! canEditSettings || canEditPayments ) {
			return null;
		}

		return (
			<Notice showDismiss={ false }>
				{ translate(
					'Only the site owner can manage shipping label payment methods. Please' +
						' contact %(ownerName)s (%(ownerLogin)s) to manage payment methods.',
					{
						args: {
							ownerName: masterUserName,
							ownerLogin: masterUserLogin,
						},
					}
				) }
			</Notice>
		);
	};

	renderSettingsPermissionNotice = () => {
		const { canEditSettings, masterUserName, masterUserLogin, translate } = this.props;
		if ( canEditSettings ) {
			return null;
		}

		return (
			<Notice showDismiss={ false }>
				{ translate(
					'Only the site owner can change these settings. Please contact %(ownerName)s (%(ownerLogin)s)' +
						' to change the shipping label settings.',
					{
						args: {
							ownerName: masterUserName,
							ownerLogin: masterUserLogin,
						},
					}
				) }
			</Notice>
		);
	};

	renderEmailReceiptsSection = () => {
		const {
			emailReceipts,
			translate,
			masterUserName,
			masterUserLogin,
			masterUserEmail,
			canEditSettings,
			canEditPayments,
		} = this.props;

		if ( ! isBoolean( emailReceipts ) ) {
			return null;
		}

		const onChange = () => this.props.setValue( 'email_receipts', ! emailReceipts );

		return (
			<FormFieldSet>
				<FormLabel className="label-settings__cards-label">
					{ translate( 'Email Receipts' ) }
				</FormLabel>
				<FormLabel>
					<FormCheckbox
						checked={ emailReceipts }
						onChange={ onChange }
						disabled={ ! canEditPayments && ! canEditSettings }
					/>
					<span className="label-settings__credit-card-description">
						{ translate(
							'Email the label purchase receipts to %(ownerName)s (%(ownerLogin)s) at %(ownerEmail)s',
							{
								args: {
									ownerName: masterUserName,
									ownerLogin: masterUserLogin,
									ownerEmail: masterUserEmail,
								},
							}
						) }
					</span>
				</FormLabel>
			</FormFieldSet>
		);
	};

	renderContent = () => {
		const { siteId, canEditSettings, isLoading, paperSize, storeOptions, translate } = this.props;

		if ( isLoading ) {
			return this.renderPlaceholder();
		}

		const onPaperSizeChange = event => this.props.setValue( 'paper_size', event.target.value );
		const paperSizes = getPaperSizes( storeOptions.origin_country );

		const onPaymentChange = value => this.props.setValue( 'selected_payment_method_id', value );

		return (
			<div>
				<FormFieldSet>
					{ this.renderSettingsPermissionNotice() }
					<FormLabel className="label-settings__cards-label">
						{ translate( 'Paper size' ) }
					</FormLabel>
					<FormSelect
						onChange={ onPaperSizeChange }
						value={ paperSize }
						disabled={ ! canEditSettings }
					>
						{ Object.keys( paperSizes ).map( size => (
							<option value={ size } key={ size }>
								{ paperSizes[ size ] }
							</option>
						) ) }
					</FormSelect>
				</FormFieldSet>
				<FormFieldSet>
					<FormLabel className="label-settings__cards-label">{ translate( 'Payment' ) }</FormLabel>
					{ this.renderPaymentPermissionNotice() }
					<PaymentSetting siteId={ siteId } onChange={ onPaymentChange } />
				</FormFieldSet>
				{ this.renderEmailReceiptsSection() }
			</div>
		);
	};

	render() {
		return <div className="label-settings__labels-container">{ this.renderContent() }</div>;
	}
}

ShippingLabels.propTypes = {
	siteId: PropTypes.number.isRequired,
	setValue: PropTypes.func.isRequired,
};

export default connect(
	( state, { siteId } ) => {
		return {
			isLoading: areSettingsFetching( state, siteId ) && ! areSettingsLoaded( state, siteId ),
			paperSize: getPaperSize( state, siteId ),
			storeOptions: getLabelSettingsStoreOptions( state, siteId ),
			canEditPayments: userCanManagePayments( state, siteId ),
			canEditSettings:
				userCanManagePayments( state, siteId ) || userCanEditSettings( state, siteId ),
			emailReceipts: getEmailReceipts( state, siteId ),
			...getMasterUserInfo( state, siteId ),
		};
	},
)( localize( ShippingLabels ) );
