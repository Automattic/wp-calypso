/**
 * External dependencies
 */

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import { find, isBoolean } from 'lodash';
import Gridicon from 'calypso/components/gridicon';

/**
 * Internal dependencies
 */
import { getPaperSizes } from 'woocommerce/woocommerce-services/lib/pdf-label-utils';
import { Button } from '@automattic/components';
import FormCheckbox from 'calypso/components/forms/form-checkbox';
import FormFieldSet from 'calypso/components/forms/form-fieldset';
import FormLabel from 'calypso/components/forms/form-label';
import FormSelect from 'calypso/components/forms/form-select';
import Notice from 'calypso/components/notice';
import NoticeAction from 'calypso/components/notice/notice-action';
import PaymentMethod, { getPaymentMethodTitle } from './label-payment-method';
import { getOrigin } from 'woocommerce/lib/nav-utils';
import {
	openAddCardDialog,
	fetchSettings,
} from 'woocommerce/woocommerce-services/state/label-settings/actions';
import {
	areSettingsFetching,
	areSettingsLoaded,
	getEmailReceipts,
	getLabelSettingsStoreOptions,
	getMasterUserInfo,
	getPaperSize,
	getPaymentMethods,
	getPaymentMethodsWarning,
	getSelectedPaymentMethodId,
	isPristine,
	userCanEditSettings,
	userCanManagePayments,
} from 'woocommerce/woocommerce-services/state/label-settings/selectors';
import QueryStoredCards from 'calypso/components/data/query-stored-cards';
import AddCardDialog from 'woocommerce/woocommerce-services/views/label-settings/add-credit-card-modal';

class ShippingLabels extends Component {
	UNSAFE_componentWillMount() {
		this.setState( { expanded: this.isExpanded( this.props ) } );
	}

	UNSAFE_componentWillReceiveProps( props ) {
		if ( props.selectedPaymentMethod !== this.props.selectedPaymentMethod ) {
			this.setState( { expanded: this.isExpanded( props ) } );
		}
	}

	isExpanded( { canEditPayments, pristine, selectedPaymentMethod } ) {
		return canEditPayments && ( ! selectedPaymentMethod || ! pristine );
	}

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
					<p className="label-settings__credit-card-description" />
					<PaymentMethod selected={ false } isLoading={ true } />
					<PaymentMethod selected={ false } isLoading={ true } />
					<Button compact />
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

	refetchSettings = () => {
		this.props.fetchSettings( this.props.siteId );
	};

	renderPaymentWarningNotice = () => {
		const { paymentMethodsWarning, translate } = this.props;
		if ( ! paymentMethodsWarning ) {
			return;
		}

		return (
			<Notice status="is-warning" showDismiss={ false } text={ paymentMethodsWarning }>
				<NoticeAction onClick={ this.refetchSettings }>{ translate( 'Retry' ) }</NoticeAction>
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

	renderAddCardExternalInfo = () => {
		const { masterUserWpcomLogin, masterUserEmail, translate } = this.props;

		if ( ! masterUserWpcomLogin ) {
			return null;
		}

		return (
			<p>
				{ translate(
					'Credit cards are retrieved from the following WordPress.com account: %(wpcomLogin)s <%(wpcomEmail)s>',
					{
						args: {
							wpcomLogin: masterUserWpcomLogin,
							wpcomEmail: masterUserEmail,
						},
					}
				) }
			</p>
		);
	};

	onVisibilityChange = () => {
		if ( ! document.hidden ) {
			this.refetchSettings();
		}
		if ( this.addCreditCardWindow && this.addCreditCardWindow.closed ) {
			document.removeEventListener( 'visibilitychange', this.onVisibilityChange );
		}
	};

	renderPaymentsSection = () => {
		const {
			siteId,
			canEditPayments,
			paymentMethods,
			selectedPaymentMethod,
			isReloading,
			translate,
		} = this.props;

		if ( ! this.state.expanded ) {
			const expand = ( event ) => {
				event.preventDefault();
				this.setState( { expanded: true } );
			};

			let summary;

			if ( selectedPaymentMethod ) {
				const { card_type: selectedType, card_digits: selectedDigits } = find( paymentMethods, {
					payment_method_id: selectedPaymentMethod,
				} );

				summary = translate(
					"We'll charge the credit card on your " +
						'account (%(card)s) to pay for the labels you print',
					{
						args: {
							card: getPaymentMethodTitle( translate, selectedType, selectedDigits ),
						},
					}
				);
			} else {
				summary = translate( 'To purchase shipping labels, add a credit card.' );
			}

			return (
				<div>
					{ this.renderPaymentPermissionNotice() }
					<p className="label-settings__credit-card-description">{ summary }</p>
					{ canEditPayments && (
						<p className="label-settings__credit-card-description">
							<Button onClick={ expand } borderless>
								{ translate( 'Choose a different card' ) }
							</Button>
						</p>
					) }
				</div>
			);
		}

		const onPaymentMethodChange = ( value ) =>
			this.props.setValue( 'selected_payment_method_id', value );

		let description, buttonLabel;
		if ( paymentMethods.length ) {
			description = translate(
				'To purchase shipping labels, choose a credit card you have on file or add a new card.'
			);
			buttonLabel = translate( 'Add another credit card' );
		} else {
			description = translate( 'To purchase shipping labels, add a credit card.' );
			buttonLabel = translate( 'Add a credit card' );
		}

		const renderPaymentMethod = ( method, index ) => {
			const onSelect = () => onPaymentMethodChange( method.payment_method_id );
			return (
				<PaymentMethod
					key={ index }
					selected={ selectedPaymentMethod === method.payment_method_id }
					type={ method.card_type }
					name={ method.name }
					digits={ method.card_digits }
					expiry={ method.expiry }
					onSelect={ onSelect }
				/>
			);
		};

		const openDialog = () => {
			this.props.openAddCardDialog( siteId );
		};

		const onAddCardExternal = () => {
			this.addCreditCardWindow = window.open( getOrigin() + '/me/purchases/add-credit-card' );
			document.addEventListener( 'visibilitychange', this.onVisibilityChange );
		};

		return (
			<div>
				{ this.renderPaymentPermissionNotice() }
				<p className="label-settings__credit-card-description">{ description }</p>
				{ ! isReloading && this.renderPaymentWarningNotice() }

				<QueryStoredCards />
				{ isReloading ? (
					<div className="label-settings__placeholder">
						<PaymentMethod selected={ false } isLoading={ true } />
						<PaymentMethod selected={ false } isLoading={ true } />
					</div>
				) : (
					paymentMethods.map( renderPaymentMethod )
				) }

				<AddCardDialog siteId={ siteId } />

				{ /* Render two buttons with internal/external classNames to conditionally show them in Calypso or wp-admin using CSS */ }
				<Button className="label-settings__internal" onClick={ openDialog } compact>
					{ buttonLabel }
				</Button>
				<div className="label-settings__credit-card-description label-settings__external">
					{ this.renderAddCardExternalInfo() }
					<Button onClick={ onAddCardExternal } compact>
						{ buttonLabel } <Gridicon icon="external" />
					</Button>
				</div>
			</div>
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
					{ translate( 'Email receipts' ) }
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
		const { canEditSettings, isLoading, paperSize, storeOptions, translate } = this.props;

		if ( isLoading ) {
			return this.renderPlaceholder();
		}

		const onPaperSizeChange = ( event ) => this.props.setValue( 'paper_size', event.target.value );
		const paperSizes = getPaperSizes( storeOptions.origin_country );

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
						{ Object.keys( paperSizes ).map( ( size ) => (
							<option value={ size } key={ size }>
								{ paperSizes[ size ] }
							</option>
						) ) }
					</FormSelect>
				</FormFieldSet>
				<FormFieldSet>
					<FormLabel className="label-settings__cards-label">{ translate( 'Payment' ) }</FormLabel>
					{ this.renderPaymentsSection() }
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
			isReloading: areSettingsFetching( state, siteId ) && areSettingsLoaded( state, siteId ),
			pristine: isPristine( state, siteId ),
			paymentMethods: getPaymentMethods( state, siteId ),
			paymentMethodsWarning: getPaymentMethodsWarning( state, siteId ),
			selectedPaymentMethod: getSelectedPaymentMethodId( state, siteId ),
			paperSize: getPaperSize( state, siteId ),
			storeOptions: getLabelSettingsStoreOptions( state, siteId ),
			canEditPayments: userCanManagePayments( state, siteId ),
			canEditSettings:
				userCanManagePayments( state, siteId ) || userCanEditSettings( state, siteId ),
			emailReceipts: getEmailReceipts( state, siteId ),
			...getMasterUserInfo( state, siteId ),
		};
	},
	( dispatch ) =>
		bindActionCreators(
			{
				openAddCardDialog,
				fetchSettings,
			},
			dispatch
		)
)( localize( ShippingLabels ) );
