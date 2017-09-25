/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';
import LinkedStateMixin from 'react-addons-linked-state-mixin';

/**
 * Internal dependencies
 */
import MeSidebarNavigation from 'me/sidebar-navigation';
import { protectForm } from 'lib/protect-form';
import formBase from 'me/form-base';
import Card from 'components/card';
import Navigation from 'me/notification-settings/navigation';
import FormCheckbox from 'components/forms/form-checkbox';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormLegend from 'components/forms/form-legend';
import FormSettingExplanation from 'components/forms/form-setting-explanation';
import FormButton from 'components/forms/form-button';
import FormSelect from 'components/forms/form-select';
import FormSectionHeading from 'components/forms/form-section-heading';
import ReauthRequired from 'me/reauth-required';
import twoStepAuthorization from 'lib/two-step-authorization';
import observe from 'lib/mixins/data-observe';
import eventRecorder from 'me/event-recorder';
import Main from 'components/main';

export default protectForm( localize( React.createClass( {
	displayName: 'NotificationSubscriptions',

	mixins: [ formBase, LinkedStateMixin, observe( 'userSettings' ), eventRecorder ],

	getDeliveryHourLabel( hour ) {
		return this.props.translate(
			'%(fromHour)s - %(toHour)s',
			{
				context: 'Hour range between which subscriptions are delivered',
				args: {
					fromHour: this.props.moment().hour( hour ).minute( 0 ).format( 'LT' ),
					toHour: this.props.moment().hour( hour + 2 ).minute( 0 ).format( 'LT' )
				}
			}
		);
	},

	render() {
		return (
		    <Main className="notifications-settings">
				<MeSidebarNavigation />
				<ReauthRequired twoStepAuthorization={ twoStepAuthorization } />

				<Navigation path={ this.props.path } />

				<Card className="me-notification-settings">
					<form id="notification-settings" onChange={ this.props.markChanged } onSubmit={ this.submitForm } >
						<FormSectionHeading>{ this.props.translate( 'Subscriptions Delivery' ) }</FormSectionHeading>
						<p>
							{ this.props.translate( '{{readerLink}}Use the Reader{{/readerLink}} to adjust delivery settings for your existing subscriptions.',
								{
									components: {
										readerLink: <a href="/following/edit" onClick={ this.recordClickEvent( 'Edit Subscriptions in Reader Link' ) } />
									}
								} )
							}
						</p>

						<FormFieldset>
							<FormLabel htmlFor="subscription_delivery_email_default">{ this.props.translate( 'Default Email Delivery' ) }</FormLabel>
							<FormSelect
								disabled={ this.getDisabledState() }
								id="subscription_delivery_email_default"
								name="subscription_delivery_email_default"
								onFocus={ this.recordFocusEvent( 'Default Email Delivery' ) }
								valueLink={ this.valueLink( 'subscription_delivery_email_default' ) } >
								<option value="never">{ this.props.translate( 'Never send email' ) }</option>
								<option value="instantly">{ this.props.translate( 'Send email instantly' ) }</option>
								<option value="daily">{ this.props.translate( 'Send email daily' ) }</option>
								<option value="weekly">{ this.props.translate( 'Send email every week' ) }</option>
							</FormSelect>
						</FormFieldset>

						<FormFieldset>
							<FormLegend>{ this.props.translate( 'Jabber Subscription Delivery' ) }</FormLegend>
							<FormLabel>
								<FormCheckbox
									checkedLink={ this.valueLink( 'subscription_delivery_jabber_default' ) }
									disabled={ this.getDisabledState() }
									id="subscription_delivery_jabber_default"
									name="subscription_delivery_jabber_default"
									onClick={ this.recordCheckboxEvent( 'Notification Delivery by Jabber' ) } />
									<span>{ this.props.translate( 'Default delivery via Jabber instant message' ) }</span>
							</FormLabel>
						</FormFieldset>

						<FormFieldset>
							<FormLabel htmlFor="subscription_delivery_mail_option">{ this.props.translate( 'Email Delivery Format' ) }</FormLabel>
							<FormSelect
								disabled={ this.getDisabledState() }
								id="subscription_delivery_mail_option"
								name="subscription_delivery_mail_option"
								onFocus={ this.recordFocusEvent( 'Email Delivery Format' ) }
								valueLink={ this.valueLink( 'subscription_delivery_mail_option' ) } >
								<option value="html">{ this.props.translate( 'HTML' ) }</option>
								<option value="text">{ this.props.translate( 'Plain Text' ) }</option>
							</FormSelect>
						</FormFieldset>

						<FormFieldset>
							<FormLabel htmlFor="subscription_delivery_day">{ this.props.translate( 'Email Delivery Window' ) }</FormLabel>
							<FormSelect
								disabled={ this.getDisabledState() }
								className="me-notification-settings__delivery-window"
								id="subscription_delivery_day"
								name="subscription_delivery_day"
								onFocus={ this.recordFocusEvent( 'Email Delivery Window Day' ) }
								valueLink={ this.valueLink( 'subscription_delivery_day' ) } >
								<option value="0">{ this.props.translate( 'Sunday' ) }</option>
								<option value="1">{ this.props.translate( 'Monday' ) }</option>
								<option value="2">{ this.props.translate( 'Tuesday' ) }</option>
								<option value="3">{ this.props.translate( 'Wednesday' ) }</option>
								<option value="4">{ this.props.translate( 'Thursday' ) }</option>
								<option value="5">{ this.props.translate( 'Friday' ) }</option>
								<option value="6">{ this.props.translate( 'Saturday' ) }</option>
							</FormSelect>

							<FormSelect
								disabled={ this.getDisabledState() }
								id="subscription_delivery_hour"
								name="subscription_delivery_hour"
								onFocus={ this.recordFocusEvent( 'Email Delivery Window Time' ) }
								valueLink={ this.valueLink( 'subscription_delivery_hour' ) } >
								<option value="0">{ this.getDeliveryHourLabel( 0 ) }</option>
								<option value="2">{ this.getDeliveryHourLabel( 2 ) }</option>
								<option value="4">{ this.getDeliveryHourLabel( 4 ) }</option>
								<option value="6">{ this.getDeliveryHourLabel( 6 ) }</option>
								<option value="8">{ this.getDeliveryHourLabel( 8 ) }</option>
								<option value="10">{ this.getDeliveryHourLabel( 10 ) }</option>
								<option value="12">{ this.getDeliveryHourLabel( 12 ) }</option>
								<option value="14">{ this.getDeliveryHourLabel( 14 ) }</option>
								<option value="16">{ this.getDeliveryHourLabel( 16 ) }</option>
								<option value="18">{ this.getDeliveryHourLabel( 18 ) }</option>
								<option value="20">{ this.getDeliveryHourLabel( 20 ) }</option>
								<option value="22">{ this.getDeliveryHourLabel( 22 ) }</option>
							</FormSelect>

							<FormSettingExplanation>
								{ this.props.translate( 'When choosing daily or weekly email delivery, which time of day would you prefer?' ) }
							</FormSettingExplanation>
						</FormFieldset>

						<FormFieldset>
							<FormLegend>{ this.props.translate( 'Block Emails' ) }</FormLegend>
							<FormLabel>
								<FormCheckbox
									checkedLink={ this.valueLink( 'subscription_delivery_email_blocked' ) }
									disabled={ this.getDisabledState() }
									id="subscription_delivery_email_blocked"
									name="subscription_delivery_email_blocked"
									onClick={ this.recordCheckboxEvent( 'Block All Notification Emails' ) } />
									<span>{ this.props.translate( 'Block all email updates from blogs you’re following on WordPress.com' ) }</span>
							</FormLabel>
						</FormFieldset>

						<FormButton
							isSubmitting={ this.state.submittingForm }
							disabled={ this.getDisabledState() }
							onClick={ this.recordClickEvent( 'Save Notification Settings Button' ) } >
							{ this.state.submittingForm ? this.props.translate( 'Saving…' ) : this.props.translate( 'Save Notification Settings' ) }
						</FormButton>
					</form>
				</Card>
			</Main>
		);
	}
} ) ) );
