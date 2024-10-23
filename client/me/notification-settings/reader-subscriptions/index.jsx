import { Card, FormLabel } from '@automattic/components';
import i18n, { localize } from 'i18n-calypso';
import { flowRight as compose } from 'lodash';
import { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
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

const NotificationSubscriptions = ( props ) => {
	const dispatch = useDispatch();
	const teams = useSelector( getReaderTeams );
	const isAutomattician = isAutomatticTeamMember( teams );
	const { translate } = props;

	const handleClickEvent = useCallback(
		( action ) => {
			return () => dispatch( recordGoogleEvent( 'Me', 'Clicked on ' + action ) );
		},
		[ dispatch ]
	);

	const handleFocusEvent = useCallback(
		( action ) => {
			return () => dispatch( recordGoogleEvent( 'Me', 'Focused on ' + action ) );
		},
		[ dispatch ]
	);

	const handleCheckboxEvent = useCallback(
		( action ) => {
			return ( event ) => {
				const eventAction = 'Clicked ' + action + ' checkbox';
				const optionValue = event.target.checked ? 1 : 0;

				dispatch( recordGoogleEvent( 'Me', eventAction, 'checked', optionValue ) );
			};
		},
		[ dispatch ]
	);

	const getDeliveryHourLabel = useCallback(
		( hour ) => {
			return translate( '%(fromHour)s - %(toHour)s', {
				context: 'Hour range between which subscriptions are delivered',
				args: {
					fromHour: props.moment().hour( hour ).minute( 0 ).format( 'LT' ),
					toHour: props
						.moment()
						.hour( hour + 2 )
						.minute( 0 )
						.format( 'LT' ),
				},
			} );
		},
		[ props ]
	);

	const { locale } = props;

	return (
		<Main wideLayout className="reader-subscriptions__notifications-settings">
			<QueryReaderTeams />

			<PageViewTracker
				path="/me/notifications/subscriptions"
				title="Me > Notifications > Subscriptions Delivery"
			/>
			<ReauthRequired twoStepAuthorization={ twoStepAuthorization } />

			<SubscriptionManagementBackButton />

			<NavigationHeader navigationItems={ [] } title={ translate( 'Notification Settings' ) } />

			<Navigation path={ props.path } />

			<Card className="reader-subscriptions__notification-settings">
				<form
					id="notification-settings"
					onChange={ props.markChanged }
					onSubmit={ props.submitForm }
				>
					<FormSectionHeading>{ translate( 'Subscriptions delivery' ) }</FormSectionHeading>
					<p>
						{ translate(
							'{{readerLink}}Use the Reader{{/readerLink}} to adjust delivery settings for your existing subscriptions.',
							{
								components: {
									readerLink: (
										<a
											href="/following/edit"
											onClick={ handleClickEvent( 'Edit Subscriptions in Reader Link' ) }
										/>
									),
								},
							}
						) }
					</p>

					<FormFieldset>
						<FormLabel htmlFor="subscription_delivery_email_default">
							{ translate( 'Default email delivery' ) }
						</FormLabel>
						<FormSelect
							disabled={ props.getDisabledState() }
							id="subscription_delivery_email_default"
							name="subscription_delivery_email_default"
							onChange={ props.updateSetting }
							onFocus={ handleFocusEvent( 'Default Email Delivery' ) }
							value={ props.getSetting( 'subscription_delivery_email_default' ) }
						>
							<option value="never">{ translate( 'Never send email' ) }</option>
							<option value="instantly">{ translate( 'Send email instantly' ) }</option>
							<option value="daily">{ translate( 'Send email daily' ) }</option>
							<option value="weekly">{ translate( 'Send email every week' ) }</option>
						</FormSelect>
					</FormFieldset>

					<FormFieldset>
						<FormLegend>{ translate( 'Jabber subscription delivery' ) }</FormLegend>
						<FormLabel>
							<FormCheckbox
								checked={ props.getSetting( 'subscription_delivery_jabber_default' ) }
								disabled={ props.getDisabledState() }
								id="subscription_delivery_jabber_default"
								name="subscription_delivery_jabber_default"
								onChange={ props.toggleSetting }
								onClick={ handleCheckboxEvent( 'Notification delivery by Jabber' ) }
							/>
							<span>{ translate( 'Default delivery via Jabber instant message' ) }</span>
						</FormLabel>
					</FormFieldset>

					<FormFieldset>
						<FormLabel htmlFor="subscription_delivery_mail_option">
							{ translate( 'Email delivery format' ) }
						</FormLabel>
						<FormSelect
							disabled={ props.getDisabledState() }
							id="subscription_delivery_mail_option"
							name="subscription_delivery_mail_option"
							onChange={ props.updateSetting }
							onFocus={ handleFocusEvent( 'Email delivery format' ) }
							value={ props.getSetting( 'subscription_delivery_mail_option' ) }
						>
							<option value="html">{ translate( 'HTML' ) }</option>
							<option value="text">{ translate( 'Plain Text' ) }</option>
						</FormSelect>
					</FormFieldset>

					<FormFieldset>
						<FormLabel htmlFor="subscription_delivery_day">
							{ translate( 'Email delivery window' ) }
						</FormLabel>
						<FormSelect
							disabled={ props.getDisabledState() }
							className="reader-subscriptions__delivery-window"
							id="subscription_delivery_day"
							name="subscription_delivery_day"
							onChange={ props.updateSetting }
							onFocus={ handleFocusEvent( 'Email delivery window day' ) }
							value={ props.getSetting( 'subscription_delivery_day' ) }
						>
							<option value="0">{ translate( 'Sunday' ) }</option>
							<option value="1">{ translate( 'Monday' ) }</option>
							<option value="2">{ translate( 'Tuesday' ) }</option>
							<option value="3">{ translate( 'Wednesday' ) }</option>
							<option value="4">{ translate( 'Thursday' ) }</option>
							<option value="5">{ translate( 'Friday' ) }</option>
							<option value="6">{ translate( 'Saturday' ) }</option>
						</FormSelect>

						<FormSelect
							disabled={ props.getDisabledState() }
							id="subscription_delivery_hour"
							name="subscription_delivery_hour"
							onChange={ props.updateSetting }
							onFocus={ handleFocusEvent( 'Email Delivery Window Time' ) }
							value={ props.getSetting( 'subscription_delivery_hour' ) }
						>
							{ [ ...Array( 12 ).keys() ].map( ( i ) => (
								<option key={ i * 2 } value={ i * 2 }>
									{ getDeliveryHourLabel( i * 2 ) }
								</option>
							) ) }
						</FormSelect>

						<FormSettingExplanation>
							{ translate(
								'When choosing daily or weekly email delivery, which time of day would you prefer?'
							) }
						</FormSettingExplanation>
					</FormFieldset>

					<FormFieldset>
						<FormLegend>
							{ locale === 'en' || i18n.hasTranslation( 'Pause emails' )
								? translate( 'Pause emails' )
								: translate( 'Block emails' ) }
						</FormLegend>
						<FormLabel>
							<FormCheckbox
								checked={ props.getSetting( 'subscription_delivery_email_blocked' ) }
								disabled={ props.getDisabledState() }
								id="subscription_delivery_email_blocked"
								name="subscription_delivery_email_blocked"
								onChange={ props.toggleSetting }
								onClick={ handleCheckboxEvent( 'Block All Notification Emails' ) }
							/>
							<span>
								{ locale === 'en' ||
								i18n.hasTranslation(
									'Pause all email updates from sites you’re following on WordPress.com'
								)
									? translate(
											'Pause all email updates from sites you’re following on WordPress.com'
									  )
									: translate(
											'Block all email updates from blogs you’re following on WordPress.com'
									  ) }
							</span>
						</FormLabel>
					</FormFieldset>

					{ isAutomattician && (
						<FormFieldset>
							<FormLegend>Auto-follow P2 posts upon commenting (Automatticians only)</FormLegend>
							<FormLabel>
								<FormCheckbox
									checked={ props.getSetting( 'p2_autofollow_on_comment' ) }
									disabled={ props.getDisabledState() }
									id="p2_autofollow_on_comment"
									name="p2_autofollow_on_comment"
									onChange={ props.toggleSetting }
									onClick={ handleCheckboxEvent( 'Auto-follow P2 Upon Comment' ) }
								/>
								<span>
									Automatically subscribe to notifications for a P2 post whenever you leave a
									comment on it.
								</span>
							</FormLabel>
						</FormFieldset>
					) }

					<FormButton
						isSubmitting={ props.isUpdatingUserSettings }
						disabled={ props.isUpdatingUserSettings || ! props.hasUnsavedUserSettings }
						onClick={ handleClickEvent( 'Save Notification Settings Button' ) }
					>
						{ props.isUpdatingUserSettings
							? translate( 'Saving…' )
							: translate( 'Save notification settings' ) }
					</FormButton>
				</form>
			</Card>
		</Main>
	);
};

export default compose(
	localize,
	protectForm,
	withLocalizedMoment,
	withFormBase
)( NotificationSubscriptions );
