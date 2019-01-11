/** @format */

/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import { find } from 'lodash';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Notice from 'components/notice';
import NoticeAction from 'components/notice/notice-action';
import PaymentMethod, { getPaymentMethodTitle } from './label-payment-method';
import { getOrigin } from 'woocommerce/lib/nav-utils';
import {
	openAddCardDialog,
	fetchSettings,
} from 'woocommerce/woocommerce-services/state/label-settings/actions';
import {
	areSettingsFetching,
	areSettingsLoaded,
	getMasterUserInfo,
	getPaymentMethods,
	getPaymentMethodsWarning,
	getSelectedPaymentMethodId,
	isPristine,
	userCanManagePayments,
} from 'woocommerce/woocommerce-services/state/label-settings/selectors';
import QueryStoredCards from 'components/data/query-stored-cards';
import AddCardDialog from 'woocommerce/woocommerce-services/views/label-settings/add-credit-card-modal';

class PaymentSetting extends Component {
	componentWillMount() {
		this.setState( { expanded: this.isExpanded( this.props ) } );
	}

	componentWillReceiveProps( props ) {
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
                <p className="label-settings__credit-card-description" />
                <PaymentMethod selected={ false } isLoading={ true } />
                <PaymentMethod selected={ false } isLoading={ true } />
                <Button compact />
            </div>
        );
    }


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

	render() {
		const {
            siteId,
			canEditPayments,
			paymentMethods,
			selectedPaymentMethod,
            isLoading,
            isReloading,
			translate,
        } = this.props;
        
        if ( isLoading ) {
			return this.renderPlaceholder();
		}

		if ( ! this.state.expanded ) {
			const expand = event => {
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
				<div className="label-settings__payment-setting">
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
			const onSelect = () => this.props.onChange( method.payment_method_id );
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
			<div className="label-settings__payment-setting">
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
}

PaymentSetting.propTypes = {
	siteId: PropTypes.number.isRequired,
	onChange: PropTypes.func.isRequired,
};

export default connect(
	( state, { siteId } ) => {
		return {
			isReloading: areSettingsFetching( state, siteId ) && areSettingsLoaded( state, siteId ),
			pristine: isPristine( state, siteId ),
			paymentMethods: getPaymentMethods( state, siteId ),
			paymentMethodsWarning: getPaymentMethodsWarning( state, siteId ),
			selectedPaymentMethod: getSelectedPaymentMethodId( state, siteId ),
			canEditPayments: userCanManagePayments( state, siteId ),
			...getMasterUserInfo( state, siteId ),
		};
	},
	dispatch =>
		bindActionCreators(
			{
				openAddCardDialog,
				fetchSettings,
			},
			dispatch
		)
)( localize( PaymentSetting ) );
