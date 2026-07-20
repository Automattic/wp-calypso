import { Card, FormLabel } from '@automattic/components';
import {
	applyDeliveryWindowEdit,
	getDeliveryHourPickerHours,
	getDisplayDeliveryWindow,
	getNumericFirstDayOfWeek,
	useDeliveryWindowTimezone,
	withLocale,
} from '@automattic/i18n-utils';
import {
	Button,
	CheckboxControl,
	__experimentalConfirmDialog as ConfirmDialog,
} from '@wordpress/components';
import { localize } from 'i18n-calypso';
import { Component } from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { withReaderTeams } from 'calypso/components/data/with-reader-teams';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormLegend from 'calypso/components/forms/form-legend';
import FormSectionHeading from 'calypso/components/forms/form-section-heading';
import FormSelect from 'calypso/components/forms/form-select';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import InlineSupportLink from 'calypso/components/inline-support-link';
import { withLocalizedMoment } from 'calypso/components/localized-moment';
import Main from 'calypso/components/main';
import NavigationHeader from 'calypso/components/navigation-header';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { protectForm } from 'calypso/lib/protect-form';
import twoStepAuthorization from 'calypso/lib/two-step-authorization';
import withFormBase from 'calypso/me/form-base/with-form-base';
import Navigation from 'calypso/me/notification-settings/navigation';
import ReauthRequired from 'calypso/me/reauth-required';
import { useNonSelfSubscriptionsCount } from 'calypso/reader/following/hooks/use-non-self-subscriptions-count';
import { isAutomatticTeamMember } from 'calypso/reader/lib/teams';
import { recordGoogleEvent } from 'calypso/state/analytics/actions';
import SubscriptionManagementBackButton from '../subscription-management-back-button';

class NotificationSubscriptions extends Component {
	state = {
		showConfirmModal: false,
	};

	checkboxNameToActionMap = {
		subscription_delivery_jabber_default: 'Notification delivery by Jabber',
		subscription_delivery_email_blocked: 'Block All Email Updates',
		p2_disable_autofollow_on_comment: 'Enable auto-follow P2 upon comment',
	};

	handleClickEvent( action ) {
		return () => this.props.recordGoogleEvent( 'Me', 'Clicked on ' + action );
	}

	handleFocusEvent( action ) {
		return () => this.props.recordGoogleEvent( 'Me', 'Focused on ' + action );
	}

	handleCheckboxEvent( action, invert = false ) {
		return ( checked ) => {
			const optionValue = invert ? ! checked : checked;
			// Create a synthetic event object that matches what updateSetting expects
			const syntheticEvent = {
				currentTarget: {
					name: action,
					value: optionValue,
				},
			};
			this.props.toggleSetting( syntheticEvent );
			const actionLabel = this.checkboxNameToActionMap[ action ];
			this.props.recordGoogleEvent(
				'Me',
				`Clicked ${ actionLabel } checkbox`,
				'checked',
				+optionValue
			);
		};
	}

	handleSubmit = ( event ) => {
		event.preventDefault();
		const isBlockingEmails = this.props.getSetting( 'subscription_delivery_email_blocked' );
		const { hasSubscriptions } = this.props;

		if ( isBlockingEmails && hasSubscriptions ) {
			this.setState( { showConfirmModal: true } );
			return;
		}

		this.props.submitForm( event );
	};

	handleSubmitButtonClick = ( event ) => {
		this.props.recordGoogleEvent( 'Me', 'Clicked on Save Notification Settings Button' );
		this.handleSubmit( event );
	};

	handleModalCancel = () => {
		// Create a synthetic event object that matches what updateSetting expects
		const syntheticEvent = {
			currentTarget: {
				name: 'subscription_delivery_email_blocked',
				value: false,
			},
		};

		this.props.updateSetting( syntheticEvent );
		this.setState( { showConfirmModal: false } );
	};

	handleModalConfirm = () => {
		// Create a synthetic event object that matches what updateSetting expects
		const syntheticEvent = {
			preventDefault: () => {},
		};
		this.props.submitForm( syntheticEvent );
		this.setState( { showConfirmModal: false } );
	};

	getDeliveryHourLabel( hour ) {
		if ( this.props.deliveryWindowIsUtcFallback ) {
			const pad = ( value ) => String( value % 24 ).padStart( 2, '0' );
			return this.props.translate( '%(fromHour)s:00 - %(toHour)s:00 UTC', {
				context: 'Hour range (in UTC) between which subscriptions are delivered',
				args: {
					fromHour: pad( hour ),
					toHour: pad( hour + 2 ),
				},
			} );
		}

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

	// The backend stores delivery hour/day as UTC. Convert to the device's local
	// time for display, and back to UTC on save, so the picker matches what the
	// user expects. Falls back to raw UTC when the time zone is unknown.
	getStoredUtcDeliveryWindow() {
		return {
			hour: parseInt( this.props.getSetting( 'subscription_delivery_hour' ), 10 ) || 0,
			day: parseInt( this.props.getSetting( 'subscription_delivery_day' ), 10 ) || 0,
		};
	}

	getDisplayDeliveryWindow() {
		return getDisplayDeliveryWindow(
			this.getStoredUtcDeliveryWindow(),
			this.props.deliveryWindowOffsetHours
		);
	}

	// Changing either the hour or the day can wrap the day boundary once
	// converted back to UTC, so we recompute and persist both settings together.
	handleDeliveryWindowChange = ( field ) => ( event ) => {
		const utc = applyDeliveryWindowEdit(
			this.getStoredUtcDeliveryWindow(),
			{ [ field ]: parseInt( event.currentTarget.value, 10 ) || 0 },
			this.props.deliveryWindowOffsetHours
		);
		this.props.updateSetting( {
			currentTarget: { name: 'subscription_delivery_day', value: String( utc.day ) },
		} );
		this.props.updateSetting( {
			currentTarget: { name: 'subscription_delivery_hour', value: String( utc.hour ) },
		} );
	};

	renderLocalizedWeekdayOptions() {
		const { translate, locale } = this.props;
		const startOfWeek = getNumericFirstDayOfWeek( locale );

		const weekDays = [
			{ value: '1', label: translate( 'Monday' ) },
			{ value: '2', label: translate( 'Tuesday' ) },
			{ value: '3', label: translate( 'Wednesday' ) },
			{ value: '4', label: translate( 'Thursday' ) },
			{ value: '5', label: translate( 'Friday' ) },
			{ value: '6', label: translate( 'Saturday' ) },
			{ value: '0', label: translate( 'Sunday' ) },
		];

		// Rotate the array based on startOfWeek
		const rotatedWeekdays = [
			...weekDays.slice( startOfWeek - 1 ),
			...weekDays.slice( 0, startOfWeek - 1 ),
		];

		return (
			<>
				{ rotatedWeekdays.map( ( { value, label } ) => (
					<option key={ value } value={ value }>
						{ label }
					</option>
				) ) }
			</>
		);
	}

	render() {
		const { teams } = this.props;
		const isAutomattician = isAutomatticTeamMember( teams );
		const displayWindow = this.getDisplayDeliveryWindow();

		return (
			<Main wideLayout className="reader-subscriptions__notifications-settings">
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
						onSubmit={ this.handleSubmit }
					>
						<FormSectionHeading>
							{ this.props.translate( 'Subscription settings' ) }
						</FormSectionHeading>
						<p>
							{ this.props.translate(
								'To manage individual site subscriptions, {{readerLink}}go to the Reader{{/readerLink}}.',
								{
									components: {
										readerLink: (
											<a
												href="/reader/subscriptions"
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
								<option value="html">{ this.props.translate( 'Visual (HTML)' ) }</option>
								<option value="text">{ this.props.translate( 'Plain text' ) }</option>
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
								onChange={ this.handleDeliveryWindowChange( 'day' ) }
								onFocus={ this.handleFocusEvent( 'Email delivery window day' ) }
								value={ String( displayWindow.day ) }
							>
								{ this.renderLocalizedWeekdayOptions() }
							</FormSelect>

							<FormSelect
								disabled={ this.props.getDisabledState() }
								id="subscription_delivery_hour"
								name="subscription_delivery_hour"
								onChange={ this.handleDeliveryWindowChange( 'hour' ) }
								onFocus={ this.handleFocusEvent( 'Email Delivery Window Time' ) }
								value={ String( displayWindow.hour ) }
							>
								{ getDeliveryHourPickerHours(
									displayWindow.hour,
									this.props.deliveryWindowIsUtcFallback
								).map( ( hour ) => (
									<option key={ hour } value={ hour }>
										{ this.getDeliveryHourLabel( hour ) }
									</option>
								) ) }
							</FormSelect>

							<FormSettingExplanation>
								{ this.props.translate(
									'When choosing daily or weekly email delivery, which time of day would you prefer?'
								) }{ ' ' }
								{ this.props.deliveryWindowIsUtcFallback || ! this.props.deliveryWindowTimezone
									? this.props.translate(
											"We couldn't detect your time zone, so these times are shown in UTC."
									  )
									: this.props.translate(
											'Times are shown in your local time zone (%(timezone)s).',
											{
												args: { timezone: this.props.deliveryWindowTimezone },
											}
									  ) }
							</FormSettingExplanation>
						</FormFieldset>

						<FormFieldset>
							<FormLegend>{ this.props.translate( 'Jabber subscription delivery' ) }</FormLegend>
							<CheckboxControl
								checked={ this.props.getSetting( 'subscription_delivery_jabber_default' ) }
								disabled={ this.props.getDisabledState() }
								id="subscription_delivery_jabber_default"
								name="subscription_delivery_jabber_default"
								onChange={ this.handleCheckboxEvent( 'subscription_delivery_jabber_default' ) }
								label={
									<span>
										{ this.props.translate( 'Receive subscription updates via instant message.' ) }{ ' ' }
										<InlineSupportLink
											supportContext="jabber-subscription-updates"
											showIcon={ false }
										/>
									</span>
								}
							/>
						</FormFieldset>

						<FormFieldset>
							<FormLegend>{ this.props.translate( 'Pause emails' ) }</FormLegend>
							<CheckboxControl
								checked={ this.props.getSetting( 'subscription_delivery_email_blocked' ) }
								disabled={ this.props.getDisabledState() }
								id="subscription_delivery_email_blocked"
								name="subscription_delivery_email_blocked"
								onChange={ this.handleCheckboxEvent( 'subscription_delivery_email_blocked' ) }
								label={ this.props.translate(
									'Pause all email updates from sites you’re subscribed to on WordPress.com'
								) }
							/>
							<FormSettingExplanation>
								{ this.props.translate(
									'Newsletters are sent via WordPress.com. If you pause emails, you will not receive newsletters from the sites you are subscribed to.'
								) }
							</FormSettingExplanation>
						</FormFieldset>

						{ isAutomattician && (
							<FormFieldset>
								<FormLegend>Auto-follow P2 posts (Automatticians only)</FormLegend>
								<CheckboxControl
									checked={ ! this.props.getSetting( 'p2_disable_autofollow_on_comment' ) }
									disabled={ this.props.getDisabledState() }
									id="p2_disable_autofollow_on_comment"
									name="p2_disable_autofollow_on_comment"
									onChange={ this.handleCheckboxEvent( 'p2_disable_autofollow_on_comment', true ) }
									label={ this.props.translate(
										'Automatically subscribe to P2 post notifications when you leave a comment.'
									) }
								/>
							</FormFieldset>
						) }

						<Button
							accessibleWhenDisabled
							variant="primary"
							showTooltip={ ! this.props.hasUnsavedUserSettings }
							label={ this.props.translate( 'No unsaved changes' ) }
							disabled={ this.props.isUpdatingUserSettings || ! this.props.hasUnsavedUserSettings }
							isBusy={ this.props.isUpdatingUserSettings }
							onClick={ this.handleSubmitButtonClick }
						>
							{ this.props.translate( 'Save notification settings' ) }
						</Button>
					</form>
				</Card>

				<ConfirmDialog
					isOpen={ this.state.showConfirmModal }
					onConfirm={ () => this.handleModalConfirm() }
					onCancel={ () => this.handleModalCancel() }
					confirmButtonText={ this.props.translate( 'Confirm' ) }
					style={ { maxWidth: '480px' } }
				>
					{ this.props.translate(
						"You have active newsletter subscriptions. Pausing emails means you won't receive any newsletter updates. Are you sure you want to continue?"
					) }
				</ConfirmDialog>
			</Main>
		);
	}
}

const mapDispatchToProps = {
	recordGoogleEvent,
};

const NotificationSubscriptionsWithHooks = ( props ) => {
	const { nonSelfSubscriptionsCount } = useNonSelfSubscriptionsCount();
	const { offsetHours, isUtcFallback, timezone } = useDeliveryWindowTimezone();
	return (
		<NotificationSubscriptions
			{ ...props }
			hasSubscriptions={ nonSelfSubscriptionsCount > 0 }
			deliveryWindowOffsetHours={ offsetHours }
			deliveryWindowIsUtcFallback={ isUtcFallback }
			deliveryWindowTimezone={ timezone }
		/>
	);
};

export default compose(
	withReaderTeams,
	connect( null, mapDispatchToProps ),
	localize,
	protectForm,
	withLocale,
	withLocalizedMoment,
	withFormBase
)( NotificationSubscriptionsWithHooks );
