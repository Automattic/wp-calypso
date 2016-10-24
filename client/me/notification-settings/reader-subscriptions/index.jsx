/**
 * External dependencies
 */
import React from 'react';
import LinkedStateMixin from 'react-addons-linked-state-mixin';

/**
 * Internal dependencies
 */
import MeSidebarNavigation from 'me/sidebar-navigation';
import protectForm from 'lib/mixins/protect-form';
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

module.exports = React.createClass( {
	displayName: 'NotificationSubscriptions',

	mixins: [ formBase, LinkedStateMixin, protectForm.mixin, observe( 'userSettings' ), eventRecorder ],

	getDeliveryHourLabel( hour ) {
		return this.translate(
			'%(fromHour)s - %(toHour)s',
			{
				context: 'Hour range between which subscriptions are delivered',
				args: {
					fromHour: this.moment().hour( hour ).minute( 0 ).format( 'LT' ),
					toHour: this.moment().hour( hour + 2 ).minute( 0 ).format( 'LT' )
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
					<form id="notification-settings" onChange={ this.markChanged } onSubmit={ this.submitForm } >
						<FormSectionHeading>{ this.translate( 'Subscriptions Delivery' ) }</FormSectionHeading>
						<p>
							{ this.translate( '{{readerLink}}Use the Reader{{/readerLink}} to adjust delivery settings for your existing subscriptions.',
								{
									components: {
										readerLink: <a href="/following/edit" onClick={ this.recordClickEvent( 'Edit Subscriptions in Reader Link' ) } />
									}
								} )
							}
						</p>

						<FormFieldset>
							<FormLabel htmlFor="subscription_delivery_email_default">{ this.translate( 'Default Email Delivery' ) }</FormLabel>
							<FormSelect
								disabled={ this.getDisabledState() }
								id="subscription_delivery_email_default"
								name="subscription_delivery_email_default"
								onFocus={ this.recordFocusEvent( 'Default Email Delivery' ) }
								valueLink={ this.valueLink( 'subscription_delivery_email_default' ) } >
								<option value="never">{ this.translate( 'Never send email' ) }</option>
								<option value="instantly">{ this.translate( 'Send email instantly' ) }</option>
								<option value="daily">{ this.translate( 'Send email daily' ) }</option>
								<option value="weekly">{ this.translate( 'Send email every week' ) }</option>
							</FormSelect>
						</FormFieldset>

						<FormFieldset>
							<FormLegend>{ this.translate( 'Jabber Subscription Delivery' ) }</FormLegend>
							<FormLabel>
								<FormCheckbox
									checkedLink={ this.valueLink( 'subscription_delivery_jabber_default' ) }
									disabled={ this.getDisabledState() }
									id="subscription_delivery_jabber_default"
									name="subscription_delivery_jabber_default"
									onClick={ this.recordCheckboxEvent( 'Notification Delivery by Jabber' ) } />
									<span>{ this.translate( 'Default delivery via Jabber instant message' ) }</span>
							</FormLabel>
						</FormFieldset>

						<FormFieldset>
							<FormLabel htmlFor="subscription_delivery_mail_option">{ this.translate( 'Email Delivery Format' ) }</FormLabel>
							<FormSelect
								disabled={ this.getDisabledState() }
								id="subscription_delivery_mail_option"
								name="subscription_delivery_mail_option"
								onFocus={ this.recordFocusEvent( 'Email Delivery Format' ) }
								valueLink={ this.valueLink( 'subscription_delivery_mail_option' ) } >
								<option value="html">{ this.translate( 'HTML' ) }</option>
								<option value="text">{ this.translate( 'Plain Text' ) }</option>
							</FormSelect>
						</FormFieldset>

						<FormFieldset>
							<FormLabel htmlFor="subscription_delivery_day">{ this.translate( 'Email Delivery Window' ) }</FormLabel>
							<FormSelect
								disabled={ this.getDisabledState() }
								className="me-notification-settings__delivery-window"
								id="subscription_delivery_day"
								name="subscription_delivery_day"
								onFocus={ this.recordFocusEvent( 'Email Delivery Window Day' ) }
								valueLink={ this.valueLink( 'subscription_delivery_day' ) } >
								<option value="0">{ this.translate( 'Sunday' ) }</option>
								<option value="1">{ this.translate( 'Monday' ) }</option>
								<option value="2">{ this.translate( 'Tuesday' ) }</option>
								<option value="3">{ this.translate( 'Wednesday' ) }</option>
								<option value="4">{ this.translate( 'Thursday' ) }</option>
								<option value="5">{ this.translate( 'Friday' ) }</option>
								<option value="6">{ this.translate( 'Saturday' ) }</option>
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
								{ this.translate( 'When choosing daily or weekly email delivery, which time of day would you prefer?' ) }
							</FormSettingExplanation>
						</FormFieldset>

						<FormFieldset>
							<FormLegend>{ this.translate( 'Block Emails' ) }</FormLegend>
							<FormLabel>
								<FormCheckbox
									checkedLink={ this.valueLink( 'subscription_delivery_email_blocked' ) }
									disabled={ this.getDisabledState() }
									id="subscription_delivery_email_blocked"
									name="subscription_delivery_email_blocked"
									onClick={ this.recordCheckboxEvent( 'Block All Notification Emails' ) }/>
									<span>{ this.translate( 'Block all email updates from blogs you’re following on WordPress.com' ) }</span>
							</FormLabel>
						</FormFieldset>

						<FormButton
							isSubmitting={ this.state.submittingForm }
							disabled={ this.getDisabledState() }
							onClick={ this.recordClickEvent( 'Save Notification Settings Button' ) } >
							{ this.state.submittingForm ? this.translate( 'Saving…' ) : this.translate( 'Save Notification Settings' ) }
						</FormButton>
					</form>
				</Card>
			</Main>
		);
	}
} );
