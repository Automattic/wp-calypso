/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { flowRight as compose } from 'lodash';

/**
 * Internal dependencies
 */
import MeSidebarNavigation from 'calypso/me/sidebar-navigation';
import { protectForm } from 'calypso/lib/protect-form';
import { Card } from '@automattic/components';
import Navigation from 'calypso/me/notification-settings/navigation';
import FormCheckbox from 'calypso/components/forms/form-checkbox';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormLabel from 'calypso/components/forms/form-label';
import FormLegend from 'calypso/components/forms/form-legend';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import FormButton from 'calypso/components/forms/form-button';
import FormSelect from 'calypso/components/forms/form-select';
import FormSectionHeading from 'calypso/components/forms/form-section-heading';
import ReauthRequired from 'calypso/me/reauth-required';
import twoStepAuthorization from 'calypso/lib/two-step-authorization';
import Main from 'calypso/components/main';
import { withLocalizedMoment } from 'calypso/components/localized-moment';
import { recordGoogleEvent } from 'calypso/state/analytics/actions';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import FormattedHeader from 'calypso/components/formatted-header';
import withFormBase from 'calypso/me/form-base/with-form-base';

class NotificationSubscriptions extends React.Component {
	handleClickEvent( action ) {
		return () => this.props.recordGoogleEvent( 'Me', 'Clicked on ' + action );
	}

	handleFocusEvent( action ) {
		return () => this.props.recordGoogleEvent( 'Me', 'Focused on ' + action );
	}

	handleCheckboxEvent( action ) {
		return ( event ) => {
			const eventAction = 'Clicked ' + action + ' checkbox';
			const optionValue = event.target.checked ? 1 : 0;

			this.props.recordGoogleEvent( 'Me', eventAction, 'checked', optionValue );
		};
	}

	getDeliveryHourLabel( hour ) {
		return this.props.translate( '%(fromHour)s - %(toHour)s', {
			context: 'Hour range between which subscriptions are delivered',
			args: {
				fromHour: this.props.moment().hour( hour ).minute( 0 ).format( 'LT' ),
				toHour: this.props
					.moment()
					.hour( hour + 2 )
					.minute( 0 )
					.format( 'LT' ),
			},
		} );
	}

	render() {
		return (
			<Main wideLayout className="reader-subscriptions__notifications-settings">
				<PageViewTracker
					path="/me/notifications/subscriptions"
					title="Me > Notifications > Subscriptions Delivery"
				/>
				<MeSidebarNavigation />
				<ReauthRequired twoStepAuthorization={ twoStepAuthorization } />

				<FormattedHeader
					brandFont
					headerText={ this.props.translate( 'Notification Settings' ) }
					align="left"
				/>

				<Navigation path={ this.props.path } />

				<Card className="reader-subscriptions__notification-settings">
					<form
						id="notification-settings"
						onChange={ this.props.markChanged }
						onSubmit={ this.props.submitForm }
					>
						<FormSectionHeading>
							{ this.props.translate( 'Subscriptions delivery' ) }
						</FormSectionHeading>
						<p>
							{ this.props.translate(
								'{{readerLink}}Use the Reader{{/readerLink}} to adjust delivery settings for your existing subscriptions.',
								{
									components: {
										readerLink: (
											<a
												href="/following/edit"
												onClick={ this.handleClickEvent( 'Edit Subscriptions in Reader Link' ) }
											/>
										),
									},
								}
							) }
						</p>

						<FormFieldset>
							<FormLabel htmlFor="subscription_delivery_email_default">
								{ this.props.translate( 'Default email delivery' ) }
							</FormLabel>
							<FormSelect
								disabled={ this.props.getDisabledState() }
								id="subscription_delivery_email_default"
								name="subscription_delivery_email_default"
								onChange={ this.props.updateSetting }
								onFocus={ this.handleFocusEvent( 'Default Email Delivery' ) }
								value={ this.props.getSetting( 'subscription_delivery_email_default' ) }
							>
								<option value="never">{ this.props.translate( 'Never send email' ) }</option>
								<option value="instantly">
									{ this.props.translate( 'Send email instantly' ) }
								</option>
								<option value="daily">{ this.props.translate( 'Send email daily' ) }</option>
								<option value="weekly">{ this.props.translate( 'Send email every week' ) }</option>
							</FormSelect>
						</FormFieldset>

						<FormFieldset>
							<FormLegend>{ this.props.translate( 'Jabber subscription delivery' ) }</FormLegend>
							<FormLabel>
								<FormCheckbox
									checked={ this.props.getSetting( 'subscription_delivery_jabber_default' ) }
									disabled={ this.props.getDisabledState() }
									id="subscription_delivery_jabber_default"
									name="subscription_delivery_jabber_default"
									onChange={ this.props.toggleSetting }
									onClick={ this.handleCheckboxEvent( 'Notification delivery by Jabber' ) }
								/>
								<span>
									{ this.props.translate( 'Default delivery via Jabber instant message' ) }
								</span>
							</FormLabel>
						</FormFieldset>

						<FormFieldset>
							<FormLabel htmlFor="subscription_delivery_mail_option">
								{ this.props.translate( 'Email delivery format' ) }
							</FormLabel>
							<FormSelect
								disabled={ this.props.getDisabledState() }
								id="subscription_delivery_mail_option"
								name="subscription_delivery_mail_option"
								onChange={ this.props.updateSetting }
								onFocus={ this.handleFocusEvent( 'Email delivery format' ) }
								value={ this.props.getSetting( 'subscription_delivery_mail_option' ) }
							>
								<option value="html">{ this.props.translate( 'HTML' ) }</option>
								<option value="text">{ this.props.translate( 'Plain Text' ) }</option>
							</FormSelect>
						</FormFieldset>

						<FormFieldset>
							<FormLabel htmlFor="subscription_delivery_day">
								{ this.props.translate( 'Email delivery window' ) }
							</FormLabel>
							<FormSelect
								disabled={ this.props.getDisabledState() }
								className="reader-subscriptions__delivery-window"
								id="subscription_delivery_day"
								name="subscription_delivery_day"
								onChange={ this.props.updateSetting }
								onFocus={ this.handleFocusEvent( 'Email delivery window day' ) }
								value={ this.props.getSetting( 'subscription_delivery_day' ) }
							>
								<option value="0">{ this.props.translate( 'Sunday' ) }</option>
								<option value="1">{ this.props.translate( 'Monday' ) }</option>
								<option value="2">{ this.props.translate( 'Tuesday' ) }</option>
								<option value="3">{ this.props.translate( 'Wednesday' ) }</option>
								<option value="4">{ this.props.translate( 'Thursday' ) }</option>
								<option value="5">{ this.props.translate( 'Friday' ) }</option>
								<option value="6">{ this.props.translate( 'Saturday' ) }</option>
							</FormSelect>

							<FormSelect
								disabled={ this.props.getDisabledState() }
								id="subscription_delivery_hour"
								name="subscription_delivery_hour"
								onChange={ this.props.updateSetting }
								onFocus={ this.handleFocusEvent( 'Email Delivery Window Time' ) }
								value={ this.props.getSetting( 'subscription_delivery_hour' ) }
							>
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
								{ this.props.translate(
									'When choosing daily or weekly email delivery, which time of day would you prefer?'
								) }
							</FormSettingExplanation>
						</FormFieldset>

						<FormFieldset>
							<FormLegend>{ this.props.translate( 'Block emails' ) }</FormLegend>
							<FormLabel>
								<FormCheckbox
									checked={ this.props.getSetting( 'subscription_delivery_email_blocked' ) }
									disabled={ this.props.getDisabledState() }
									id="subscription_delivery_email_blocked"
									name="subscription_delivery_email_blocked"
									onChange={ this.props.toggleSetting }
									onClick={ this.handleCheckboxEvent( 'Block All Notification Emails' ) }
								/>
								<span>
									{ this.props.translate(
										'Block all email updates from blogs you’re following on WordPress.com'
									) }
								</span>
							</FormLabel>
						</FormFieldset>

						<FormButton
							isSubmitting={ this.props.isUpdatingUserSettings }
							disabled={ this.props.isUpdatingUserSettings || ! this.props.hasUnsavedUserSettings }
							onClick={ this.handleClickEvent( 'Save Notification Settings Button' ) }
						>
							{ this.props.isUpdatingUserSettings
								? this.props.translate( 'Saving…' )
								: this.props.translate( 'Save notification settings' ) }
						</FormButton>
					</form>
				</Card>
			</Main>
		);
	}
}

export default compose(
	connect( null, { recordGoogleEvent } ),
	localize,
	protectForm,
	withLocalizedMoment,
	withFormBase
)( NotificationSubscriptions );
