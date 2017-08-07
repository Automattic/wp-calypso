/**
 * External dependencies
 */
import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import { isBoolean } from 'lodash';

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
		const setFormDataValue = ( key, value ) => ( actions.setFormDataValue( siteId, key, value ) );
		const onEnabledToggle = () => ( actions.setFormDataValue( siteId, 'enabled', ! formData.enabled ) );

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
					isLoading={ formMeta.isFetching }
					pristine={ formMeta.pristine }
					paymentMethods={ formMeta.payment_methods || [] }
					setFormDataValue={ setFormDataValue }
					selectedPaymentMethod={ ( formData || {} ).selected_payment_method_id }
					paperSize={ ( formData || {} ).paper_size }
					storeOptions={ storeOptions }
				/>
			);
		};

		//hide the toggle when the enabled flag is not present (older version of WCS) and respect the setting otherwise.
		const renderToggle = formData && isBoolean( formData.enabled );
		const hidden = formData && isBoolean( formData.enabled ) && ! formData.enabled;

		return (
			<div>
				<ExtendedHeader
					label={ translate( 'Shipping Labels' ) }
					description={ translate( 'Print shipping labels yourself and save a trip to the post office.' ) }>
					{ renderToggle && <FormToggle checked={ formData.enabled } onChange={ onEnabledToggle } /> }
				</ExtendedHeader>
				<Card className={ classNames( 'label-settings__labels-container', { hidden } ) }>
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
