/**
 * External dependencies
 */
import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import ExtendedHeader from 'woocommerce/components/extended-header';
import FormToggle from 'components/forms/form-toggle';
import LabelSettings from './label-settings';
import * as settingsActions from '../../state/label-settings/actions';
import { getSelectedSiteId } from 'state/ui/selectors';
import {
	getLabelSettingsFormData,
	getLabelSettingsFormMeta,
	getLabelSettingsStoreOptions
} from '../../state/label-settings/selectors';

class AccountSettingsRootView extends Component {

	componentWillMount() {
		if ( this.props.siteId ) {
			this.props.actions.fetchSettings( this.props.siteId );
		}
	}

	componentWillReceiveProps( props ) {
		if ( props.siteId !== this.props.siteId ) {
			this.props.actions.fetchSettings( props.siteId );
		}
	}

	render() {
		const { formData, formMeta, storeOptions, siteId, translate, actions } = this.props;

		if ( ! formMeta ) {
			return null;
		}
//	const onSaveSuccess = () => {
//		actions.setFormMetaProperty( 'pristine', true );
//		noticeActions.successNotice( __( 'Your payment method has been updated.' ), { duration: 5000 } );
//	};
//	const onSaveFailure = () => noticeActions.errorNotice( __( 'Unable to update your payment method. Please try again.' ) );
//	const onSaveChanges = () => actions.submit( onSaveSuccess, onSaveFailure );
		const setFormDataValue = ( key, value ) => ( actions.setFormDataValue( siteId, key, value ) );

		const renderContent = () => {
			if ( ! formData && ! formMeta.isFetching ) {
				return (
					<p>
						{ translate( 'Unable to get your settings. Please refresh the page to try again.' ) }
					</p>
				);
			}

			return (
				<LabelSettings
					isLoading={ ( formMeta || {} ).isFetching }
					paymentMethods={ formMeta.payment_methods || [] }
					setFormDataValue={ setFormDataValue }
					selectedPaymentMethod={ ( formData || {} ).selected_payment_method_id }
					paperSize={ ( formData || {} ).paper_size }
					storeOptions={ storeOptions }
				/>
			);
		};

		return (
			<div>
				<ExtendedHeader
					label={ translate( 'Shipping Labels' ) }
					description={ translate( 'Print shipping labels yourself and save a trip to the post office.' ) }>
					<FormToggle checked={ false } />
				</ExtendedHeader>
				<Card className={ classNames( 'label-settings__labels-container', { hidden: false } ) }>
					{ renderContent() }
				</Card>
			</div>
		);
	}
}

AccountSettingsRootView.propTypes = {
	submit: PropTypes.func,
};

function mapStateToProps( state ) {
	return {
		siteId: getSelectedSiteId( state ),
		storeOptions: getLabelSettingsStoreOptions( state ),
		formData: getLabelSettingsFormData( state ),
		formMeta: getLabelSettingsFormMeta( state ),
	};
}

function mapDispatchToProps( dispatch ) {
	return {
		actions: bindActionCreators( settingsActions, dispatch ),
	};
}

export default connect(
	mapStateToProps,
	mapDispatchToProps
)( localize( AccountSettingsRootView ) );
