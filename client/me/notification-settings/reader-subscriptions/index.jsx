import { Card, FormLabel, Dialog } from '@automattic/components';
import { getNumericFirstDayOfWeek, withLocale } from '@automattic/i18n-utils';
import { Button, CheckboxControl } from '@wordpress/components';
import { localize } from 'i18n-calypso';
import { flowRight as compose } from 'lodash';
import { Component } from 'react';
import { connect } from 'react-redux';
import QueryReaderTeams from 'calypso/components/data/query-reader-teams';
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
import { useSiteSubscriptions } from 'calypso/reader/following/use-site-subscriptions';
import { isAutomatticTeamMember } from 'calypso/reader/lib/teams';
import { recordGoogleEvent } from 'calypso/state/analytics/actions';
import { getReaderTeams } from 'calypso/state/teams/selectors';
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
			{ value: '7', label: translate( 'Sunday' ) },
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
						onSubmit={ this.handleSubmit }
					>
						<FormSectionHeading>
							{ this.props.translate( 'Email subscriptions' ) }
						</FormSectionHeading>
						<p>
							{ this.props.translate(
								'{{readerLink}}Visit the Reader{{/readerLink}} to adjust individual site subscriptions.',
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
								onChange={ this.props.updateSetting }
								onFocus={ this.handleFocusEvent( 'Email delivery window day' ) }
								value={ this.props.getSetting( 'subscription_delivery_day' ) }
							>
								{ this.renderLocalizedWeekdayOptions() }
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
							variant="primary"
							disabled={ this.props.isUpdatingUserSettings || ! this.props.hasUnsavedUserSettings }
							isBusy={ this.props.isUpdatingUserSettings }
							onClick={ this.handleSubmitButtonClick }
						>
							{ this.props.translate( 'Save notification settings' ) }
						</Button>
					</form>
				</Card>

				<Dialog
					isVisible={ this.state.showConfirmModal }
					onClose={ () => this.setState( { showConfirmModal: false } ) }
					buttons={ [
						{
							action: 'cancel',
							label: this.props.translate( 'Cancel' ),
							onClick: () => this.handleModalCancel(),
						},
						{
							action: 'confirm',
							label: this.props.translate( 'Confirm' ),
							onClick: () => {
								this.setState( { showConfirmModal: false } );
								// Create a synthetic event object
								const syntheticEvent = {
									preventDefault: () => {},
								};
								this.props.submitForm( syntheticEvent );
							},
							isPrimary: true,
						},
					] }
				>
					<p>
						{ this.props.translate(
							"You have active newsletter subscriptions. Pausing emails means you won't receive any newsletter updates. Are you sure you want to continue?"
						) }
					</p>
				</Dialog>
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

const NotificationSubscriptionsWithHooks = ( props ) => {
	const { hasNonSelfSubscriptions } = useSiteSubscriptions();
	return <NotificationSubscriptions hasSubscriptions={ hasNonSelfSubscriptions } { ...props } />;
};

export default compose(
	connect( mapStateToProps, mapDispatchToProps ),
	localize,
	protectForm,
	withLocale,
	withLocalizedMoment,
	withFormBase
)( NotificationSubscriptionsWithHooks );
