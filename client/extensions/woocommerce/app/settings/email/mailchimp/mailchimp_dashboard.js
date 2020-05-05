/**
 * External dependencies
 *
 */

import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { localize } from 'i18n-calypso';
import { Card } from '@automattic/components';
import FormCheckbox from 'components/forms/form-checkbox';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormLegend from 'components/forms/form-legend';
import CompactFormToggle from 'components/forms/form-toggle/compact';
import FormTextInput from 'components/forms/form-text-input';
import Notice from 'components/notice';
import QueryMailChimpSyncStatus from 'woocommerce/state/sites/settings/mailchimp/querySyncStatus';
import {
	syncStatus,
	mailChimpSettings,
	isRequestingSettings,
	isRequestingSyncStatus,
	isSavingMailChimpSettings,
	isSubmittingNewsletterSetting,
	newsletterSettingsSubmitError,
} from 'woocommerce/state/sites/settings/mailchimp/selectors';
import {
	submitMailChimpNewsletterSettings,
	requestResync,
} from 'woocommerce/state/sites/settings/mailchimp/actions.js';
import { errorNotice, successNotice } from 'state/notices/actions';
import SyncTab from './sync_tab.js';

const Settings = localize( ( { translate, settings, oldCheckbox, onChange } ) => {
	const onCheckedStateChange = () => {
		const currentValue = settings.mailchimp_checkbox_defaults;
		const nextValue = currentValue === 'check' ? 'uncheck' : 'check';
		onChange( { mailchimp_checkbox_defaults: nextValue } );
	};

	const onNewsletterLabelChange = ( e ) => {
		onChange( { newsletter_label: e.target.value } );
	};

	const onToggleSubscribeMessage = ( e ) => {
		// check if we had previously selected something in checked/unchecked area
		// this way we can use old value on toggling visibility,
		// this is just to improve UX
		const visibleOption = 'hide' !== oldCheckbox ? oldCheckbox : 'check';
		onChange( { mailchimp_checkbox_defaults: e ? visibleOption : 'hide' } );
	};

	const subscriptionPromptState = settings.mailchimp_checkbox_defaults;
	const toggle = subscriptionPromptState === 'check' || subscriptionPromptState === 'uncheck';
	return (
		<div className="mailchimp__dashboard-settings">
			<span className="mailchimp__dashboard-settings-form">
				<FormFieldset>
					<FormLegend>{ translate( 'Newsletter subscriptions' ) }</FormLegend>
					<FormLabel className="mailchimp__dashboard-settings-form-field">
						<CompactFormToggle
							checked={ toggle }
							onChange={ onToggleSubscribeMessage }
							id="show-subscribe-message"
						/>
						<span>{ translate( 'Show a subscribe message to customer at checkout' ) }</span>
					</FormLabel>
					<FormLabel className="mailchimp__dashboard-settings-form-field">
						<FormCheckbox
							className="mailchimp__dashboard-settings-form-checkbox"
							checked={ 'check' === subscriptionPromptState }
							disabled={ ! toggle }
							onChange={ onCheckedStateChange }
						/>
						<span>{ translate( 'Subscribe message is checked by default' ) }</span>
					</FormLabel>
				</FormFieldset>
				<FormFieldset>
					<FormLabel className="mailchimp__dashboard-settings-form-field mailchimp__dashboard-settings-subscribe-message">
						<span>{ translate( 'Subscribe message' ) }</span>
					</FormLabel>
					<FormTextInput
						name="newsletter_label"
						onChange={ onNewsletterLabelChange }
						value={ settings.newsletter_label }
					/>
				</FormFieldset>
			</span>
			<span className="mailchimp__dashboard-settings-preview">
				<div className="mailchimp__dashboard-settings-preview-heading">
					{ translate( 'PREVIEW' ) }
				</div>
				<div className="mailchimp__dashboard-settings-preview-view">
					{ toggle && (
						<FormLabel>
							<FormCheckbox checked={ 'check' === subscriptionPromptState } disabled />
							<span>{ settings.newsletter_label }</span>
						</FormLabel>
					) }
				</div>
			</span>
		</div>
	);
} );

Settings.propTypes = {
	settings: PropTypes.object,
	oldCheckbox: PropTypes.string,
	isSaving: PropTypes.bool,
	onChange: PropTypes.func.isRequired,
	onSave: PropTypes.func.isRequired,
};

class MailChimpDashboard extends React.Component {
	constructor( props ) {
		super( props );
		this.state = {
			syncStatus: null,
			settings: props.settings,
		};
	}

	UNSAFE_componentWillReceiveProps( nextProps ) {
		const { translate } = nextProps;
		if ( false === nextProps.isSaving && this.props.isSaving ) {
			if ( nextProps.newsletterSettingsSubmitError ) {
				nextProps.errorNotice(
					translate( 'There was a problem saving MailChimp settings. Please try again.' )
				);
			} else {
				nextProps.successNotice( translate( 'MailChimp settings saved.' ), { duration: 4000 } );
			}
		}
		if ( false === this.props.saveSettingsRequest && nextProps.saveSettingsRequest ) {
			this.onSave();
		}
	}

	onSettingsChange = ( change ) => {
		this.setState( { settings: Object.assign( {}, this.state.settings, change ) } );
		if ( this.props.onChange ) {
			this.props.onChange();
		}
	};

	onSave = () => {
		const { submitMailChimpNewsletterSettings: submit, siteId } = this.props;
		const settings = this.state.settings;
		const message = {
			mailchimp_list: settings.mailchimp_list,
			newsletter_label: settings.newsletter_label,
			mailchimp_auto_subscribe: settings.mailchimp_auto_subscribe,
			mailchimp_checkbox_defaults: settings.mailchimp_checkbox_defaults,
			mailchimp_checkbox_action: settings.mailchimp_checkbox_action,
		};
		submit( siteId, message );
	};

	render() {
		const { siteId, syncStatusData, translate, onNoticeExit, wizardCompleted } = this.props;
		return (
			<div>
				<QueryMailChimpSyncStatus siteId={ siteId } />
				{ wizardCompleted && (
					<Notice
						className="mailchimp__dashboard-success-notice"
						status="is-success"
						showDismiss
						onDismissClick={ onNoticeExit }
						text={ translate(
							'Nice! The last thing to do is to make sure the newsletter subscriptions are looking good.'
						) }
					/>
				) }
				<Card className="mailchimp__dashboard">
					<div className="mailchimp__dashboard-first-section">
						<span className="mailchimp__dashboard-title-and-slogan">
							<div>
								<div className="mailchimp__dashboard-title">MailChimp</div>
								<div className="mailchimp__header-description">
									{ translate( 'Allow customers to subscribe to your MailChimp email list' ) }
								</div>
							</div>
						</span>
						<span className="mailchimp__dashboard-sync-status">
							<SyncTab
								siteId={ siteId }
								isRequesting={ this.props.isRequestingSyncStatus }
								syncState={ syncStatusData }
								resync={ this.props.requestResync }
							/>
						</span>
					</div>
					<div className="mailchimp__dashboard-second-section">
						<Settings
							settings={ this.state.settings }
							isRequesting={ this.props.isRequestingSettings }
							onChange={ this.onSettingsChange }
							onSave={ this.onSave }
							isSaving={ this.props.isSaving }
							oldCheckbox={ this.props.settings.mailchimp_checkbox_defaults }
						/>
					</div>
				</Card>
			</div>
		);
	}
}

MailChimpDashboard.propTypes = {
	siteId: PropTypes.number.isRequired,
	syncStatusData: PropTypes.object,
	isRequestingSettings: PropTypes.bool,
	isSaving: PropTypes.bool,
	newsletterSettingsSubmitError: PropTypes.oneOfType( [ PropTypes.object, PropTypes.bool ] ),
	onChange: PropTypes.func,
	settings: PropTypes.object.isRequired,
	errorNotice: PropTypes.func.isRequired,
	successNotice: PropTypes.func.isRequired,
	submitMailChimpNewsletterSettings: PropTypes.func.isRequired,
	requestResync: PropTypes.func.isRequired,
};

export default connect(
	( state, { siteId } ) => ( {
		siteId,
		syncStatusData: syncStatus( state, siteId ),
		isRequestingSettings: isRequestingSettings( state, siteId ),
		isRequestingSyncStatus: isRequestingSyncStatus( state, siteId ),
		isSaving: isSubmittingNewsletterSetting( state, siteId ),
		saveSettingsRequest: isSavingMailChimpSettings( state, siteId ),
		newsletterSettingsSubmitError: newsletterSettingsSubmitError( state, siteId ),
		settings: mailChimpSettings( state, siteId ),
	} ),
	{
		errorNotice,
		successNotice,
		submitMailChimpNewsletterSettings,
		requestResync,
	}
)( localize( MailChimpDashboard ) );
