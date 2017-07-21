/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { translate as __ } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import ActionButtons from 'components/action-buttons';
import CompactCard from 'components/card/compact';
import GlobalNotices from 'components/global-notices';
import LabelSettings from './label-settings';
import notices from 'notices';
import * as settingsActions from '../state/actions';
import * as NoticeActions from 'state/notices/actions';

const AccountSettingsRootView = ( { formData, formMeta, actions, noticeActions, storeOptions } ) => {
	const onSaveSuccess = () => {
		actions.setFormMetaProperty( 'pristine', true );
		noticeActions.successNotice( __( 'Your payment method has been updated.' ), { duration: 5000 } );
	};
	const onSaveFailure = () => noticeActions.errorNotice( __( 'Unable to update your payment method. Please try again.' ) );
	const onSaveChanges = () => actions.submit( onSaveSuccess, onSaveFailure );

	const buttons = [
		{
			label: __( 'Save changes' ),
			onClick: onSaveChanges,
			isPrimary: true,
			isDisabled: formMeta.pristine || formMeta.isSaving,
		},
	];

	const renderContent = () => {
		if ( ! formData && ! formMeta.isFetching ) {
			return (
				<p className="error-message">
					{ __( 'Unable to get your settings. Please refresh the page to try again.' ) }
				</p>
			);
		}
		return (
			<LabelSettings
				isLoading={ formMeta.isFetching }
				paymentMethods={ formMeta.payment_methods || [] }
				setFormDataValue={ actions.setFormDataValue }
				selectedPaymentMethod={ ( formData || {} ).selected_payment_method_id }
				paperSize={ ( formData || {} ).paper_size }
				storeOptions={ storeOptions }
			/>
		);
	};

	return (
		<div>
			<GlobalNotices id="notices" notices={ notices.list } />
			<CompactCard>
				{ renderContent() }
			</CompactCard>
			<CompactCard className="save-button-bar">
				<ActionButtons
					buttons={ buttons }
				/>
			</CompactCard>
		</div>
	);
};

AccountSettingsRootView.propTypes = {
	submit: PropTypes.func,
};

function mapStateToProps( state ) {
	return {
		storeOptions: state.form.storeOptions,
		formData: state.form.data,
		formMeta: state.form.meta,
	};
}

function mapDispatchToProps( dispatch ) {
	return {
		actions: bindActionCreators( settingsActions, dispatch ),
		noticeActions: bindActionCreators( NoticeActions, dispatch ),
	};
}

export default connect(
	mapStateToProps,
	mapDispatchToProps
)( AccountSettingsRootView );
