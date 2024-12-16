import { Card, FormLabel } from '@automattic/components';
import i18n, { localize } from 'i18n-calypso';
import { flowRight as compose } from 'lodash';
import { Component } from 'react';
import { connect } from 'react-redux';
import QueryReaderTeams from 'calypso/components/data/query-reader-teams';
import FormButton from 'calypso/components/forms/form-button';
import FormCheckbox from 'calypso/components/forms/form-checkbox';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormLegend from 'calypso/components/forms/form-legend';
import FormSectionHeading from 'calypso/components/forms/form-section-heading';
import FormSelect from 'calypso/components/forms/form-select';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import { withLocalizedMoment } from 'calypso/components/localized-moment';
import Main from 'calypso/components/main';
import NavigationHeader from 'calypso/components/navigation-header';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { protectForm } from 'calypso/lib/protect-form';
import twoStepAuthorization from 'calypso/lib/two-step-authorization';
import withFormBase from 'calypso/me/form-base/with-form-base';
import Navigation from 'calypso/me/notification-settings/navigation';
import ReauthRequired from 'calypso/me/reauth-required';
import { isAutomatticTeamMember } from 'calypso/reader/lib/teams';
import { recordGoogleEvent } from 'calypso/state/analytics/actions';
import { getReaderTeams } from 'calypso/state/teams/selectors';
import SubscriptionManagementBackButton from '../subscription-management-back-button';

class NotificationSubscriptions extends Component {
	handleClickEvent( action ) {
		return () => this.props.recordGoogleEvent( 'Me', 'Clicked on ' + action );
	}

	handleFocusEvent( action ) {
		return () => this.props.recordGoogleEvent( 'Me', 'Focused on ' + action );
	}

	handleCheckboxEvent( action, invert = false ) {
		return ( event ) => {
			const optionValue = invert ? ! event.target.checked : event.target.checked;
			this.props.recordGoogleEvent( 'Me', `Clicked ${ action } checkbox`, 'checked', +optionValue );
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
		const { locale, teams } = this.props;
		const isAutomattician = isAutomatticTeamMember( teams );

		return (
			<Main wideLayout className="reader-subscriptions__notifications-settings">
				<QueryReaderTeams />

				<PageViewTracker
					path="/me/notifications/subscriptions"
					title="Me > Notifications > Subscriptions Delivery"
				/>
				<ReauthRequired twoStepAuthorization={ twoStepAuthorization } />

				<SubscriptionManagementBackButton />

				<NavigationHeader
					navigationItems={ [] }
					title={ this.props.translate( 'Notification Settings' ) }
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
							<FormLegend>
								{ locale === 'en' || i18n.hasTranslation( 'Pause emails' )
									? this.props.translate( 'Pause emails' )
									: this.props.translate( 'Block emails' ) }
							</FormLegend>
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
										'Pause all email updates from sites you’re subscribed to on WordPress.com'
									) }
								</span>
							</FormLabel>
						</FormFieldset>

						{ isAutomattician && (
							<FormFieldset>
								<FormLegend>Auto-follow P2 posts (Automatticians only)</FormLegend>
								<FormLabel>
									<FormCheckbox
										checked={ ! this.props.getSetting( 'p2_disable_autofollow_on_comment' ) }
										disabled={ this.props.getDisabledState() }
										id="p2_disable_autofollow_on_comment"
										name="p2_disable_autofollow_on_comment"
										onChange={ this.props.toggleSetting }
										onClick={ this.handleCheckboxEvent(
											'Enable auto-follow P2 upon comment',
											true
										) }
									/>
									<span>
										Automatically subscribe to P2 post notifications when you leave a comment.
									</span>
								</FormLabel>
							</FormFieldset>
						) }

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

const mapStateToProps = ( state ) => ( {
	teams: getReaderTeams( state ),
} );

const mapDispatchToProps = {
	recordGoogleEvent,
};

export default compose(
	connect( mapStateToProps, mapDispatchToProps ),
	localize,
	protectForm,
	withLocalizedMoment,
	withFormBase
)( NotificationSubscriptions );
