/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { localize } from 'i18n-calypso';
import Button from 'components/button';
import Card from 'components/card';
import FormCheckbox from 'components/forms/form-checkbox';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormLegend from 'components/forms/form-legend';
import FormToggle from 'components/forms/form-toggle';
import FormRadio from 'components/forms/form-radio';
import FormTextInput from 'components/forms/form-text-input';
import Notice from 'components/notice';
import QueryMailChimpSyncStatus from 'woocommerce/state/sites/settings/email/querySyncStatus';
import {
	syncStatus,
	mailchimpSettings,
	isRequestingSettings
	} from 'woocommerce/state/sites/settings/email/selectors';
import { submitMailchimpNewsletterSettings, requestResync } from 'woocommerce/state/sites/settings/email/actions.js';
import { isSubmittingNewsletterSetting, newsletterSettingsSubmitError } from 'woocommerce/state/sites/settings/email/selectors';
import { errorNotice, successNotice } from 'state/notices/actions';

const SyncTab = localize( ( { siteId, translate, syncState, resync } ) => {
	const { account_name, store_syncing, product_count, mailchimp_total_products,
		mailchimp_total_orders, order_count } = syncState;
	const hasProductInfo = ( product_count !== undefined ) && ( mailchimp_total_products !== undefined );
	const products = hasProductInfo ? ( product_count + '/' + mailchimp_total_products ) : '';
	const hasOrdersInfo = ( order_count !== undefined ) && ( mailchimp_total_orders !== undefined );
	const orders = hasOrdersInfo ? ( order_count + '/' + mailchimp_total_orders ) : '';

	const synced = () => (
		<Notice
			status="is-success"
			isCompact
			showDismiss={ false }
			text={ translate( '%(mailingListname)s list synced.', {
				args: { mailingListname: syncState.mailchimp_list_name } } ) }
		/>
	);

	const syncing = () => (
		<Notice
			status="is-warning"
			isCompact
			showDismiss={ false }
			text={ translate( '%(mailingListname)s list is being synced.', {
				args: { mailingListname: syncState.mailchimp_list_name } } ) }
		/>
	);

	const onResyncClick = () => {
		! store_syncing && resync( siteId );
	};

	return (
		<div>
			<div>
				<span className="mailchimp__account-info">{ translate( 'MailChimp account:' ) }</span>
				<span>{ account_name }</span>
			</div>
			<span>{ store_syncing ? syncing() : synced() }</span>
			<a onClick={ onResyncClick }>{ translate( 'Resync' ) }</a>
			<div>
				<span className="mailchimp__account-info" >{ translate( 'Products:' ) }</span>
				<span>{ products }</span>
				<span className="mailchimp__account-info" >{ ' ' + translate( 'Orders:' ) }</span>
				<span>{ orders || '' }</span>
			</div>
		</div>
	);
} );

const Settings = localize( ( { translate, settings, oldCheckbox, isSubbmittingSettings, onChange, onSave } ) => {
	const onRadioChange = ( e ) => {
		onChange( { mailchimp_checkbox_defaults: e.target.value } );
	};

	const onNewslatterLabelChange = ( e ) => {
		onChange( { newsletter_label: e.target.value } );
	};

	const onToggle = ( e ) => {
		const visibleOption = oldCheckbox !== 'hide' ? oldCheckbox : 'check';
		onChange( { mailchimp_checkbox_defaults: e ? visibleOption : 'hide' } );
	};

	const checkbox = settings.mailchimp_checkbox_defaults;
	const toggle = checkbox === 'check' || checkbox === 'uncheck';
	return (
		<div className="mailchimp__dashboard-settings">
			<span className="mailchimp__dashboard-settings-form">
				<FormFieldset>
					<FormLegend>{ translate( 'Newsletter subscriptions' ) }</FormLegend>
					<FormLabel>
						<FormToggle
							checked={ toggle }
							onChange={ onToggle }
							id="show-subscribe-message"
						/>
						<span>{ translate( 'Show a subscribe message to customer at checkout' ) }</span>
					</FormLabel>
					<FormLabel>
						<FormRadio
							disabled={ ! toggle }
							value="check"
							checked={ 'check' === checkbox }
							onChange={ onRadioChange }
						/>
						<span>{ translate( 'Subscribe message is checked by default' ) }</span>
					</FormLabel>
					<FormLabel>
						<FormRadio
							disabled={ ! toggle }
							value="uncheck"
							checked={ 'uncheck' === checkbox }
							onChange={ onRadioChange }
						/>
						<span>{ translate( 'Subscribe message is unchecked by default' ) }</span>
					</FormLabel>
					<FormLabel>
						{ translate( 'Subscribe message' ) }
					</FormLabel>
					<FormTextInput
						name="newsletter_label"
						onChange={ onNewslatterLabelChange }
						value={ settings.newsletter_label }
					/>
				</FormFieldset>
			</span>
			<span className="mailchimp__dashboard-settings-preview">
				<div>{ translate( 'PREVIEW' ) }</div>
				<div className="mailchimp__dashboard-settings-preview-view">
					{ toggle && <FormLabel>
							<FormCheckbox checked={ checkbox === 'check' } disabled={ true } />
							<span>{ settings.newsletter_label }</span>
						</FormLabel>}
				</div>
				<div className="mailchimp__dashboard-settings-save">
					<Button
						primary
						onClick={ onSave }
						busy={ isSubbmittingSettings }
						disabled={ isSubbmittingSettings }>
						{ translate( 'Save' ) }
					</Button>
				</div>
			</span>
		</div>
	);
} );

class MailChimpDashboard extends React.Component {

	constructor( props ) {
		super( props );
		this.state = {
			syncStatus: null,
			settings: props.settings,
		};
	}

	componentWillReceiveProps( nextProps ) {
		const { translate } = nextProps;
		if ( ( false === nextProps.isSubmittingNewsletterSetting ) && this.props.isSubmittingNewsletterSetting ) {
			if ( nextProps.newsletterSettingsSubmitError ) {
				nextProps.errorNotice( translate( 'There was a problem saving the email settings. Please try again.' ) );
			} else {
				nextProps.successNotice( translate( 'Email settings saved.' ), { duration: 4000 } );
			}
		}
	}

	onSettingsChange = ( change ) => {
		this.setState( { settings: Object.assign( {}, this.state.settings, change ) } );
	}

	onSave = () => {
		const { submitMailchimpNewsletterSettings: submit, siteId } = this.props;
		const settings = this.state.settings;
		const message = {
			mailchimp_list: settings.mailchimp_list,
			newsletter_label: settings.newsletter_label,
			mailchimp_auto_subscribe: settings.mailchimp_auto_subscribe,
			mailchimp_checkbox_defaults: settings.mailchimp_checkbox_defaults,
			mailchimp_checkbox_action: settings.mailchimp_checkbox_action,
		};
		submit( siteId, message );
	}

	render() {
		const { siteId, syncStatusData, translate } = this.props;
		return (
			<div>
				<QueryMailChimpSyncStatus siteId={ siteId } />
				<Card className="mailchimp__dashboard" >
					<div className="mailchimp__dashboard-first-section" >
						<span className="mailchimp__dashboard-title-and-slogan">
							<div className="mailchimp__dashboard-title">MailChimp</div>
							<div>{ translate( 'Allow customers to subscribe to your MailChimp email list' ) }</div>
						</span>
						<span className="mailchimp__dashboard-sync-status" >
							<SyncTab
								siteId={ siteId }
								syncState={ syncStatusData }
								resync={ this.props.requestResync } />
						</span>
					</div>
					<div className="mailchimp__dashboard-second-section" >
						<Settings
							settings={ this.state.settings }
							isRequesting={ this.props.isRequestingSettings }
							onChange={ this.onSettingsChange }
							onSave={ this.onSave }
							isSubbmittingSettings={ this.props.isSubmittingNewsletterSetting }
							oldCheckbox={ this.props.settings.mailchimp_checkbox_defaults } />
					</div>
					<Button className="mailchimp__getting-started-button" onClick={ this.props.onClick }>
						{ translate( 'Start setup wizard.' ) }
					</Button>
				</Card>
			</div>
		);
	}
}

export default connect(
	( state, { siteId } ) => ( {
		siteId,
		syncStatusData: syncStatus( state, siteId ),
		isRequestingSettings: isRequestingSettings( state, siteId ),
		isSubmittingNewsletterSetting: isSubmittingNewsletterSetting( state, siteId ),
		newsletterSettingsSubmitError: newsletterSettingsSubmitError( state, siteId ),
		settings: mailchimpSettings( state, siteId ),
	} ),
	{
		errorNotice,
		successNotice,
		submitMailchimpNewsletterSettings,
		requestResync
	}
)( localize( MailChimpDashboard ) );
