import { Button, Gridicon } from '@automattic/components';
import { Modal, ToggleControl } from '@wordpress/components';
import emailValidator from 'email-validator';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import clockIcon from 'calypso/assets/images/jetpack/clock-icon.svg';
import SelectDropdown from 'calypso/components/select-dropdown';
import TokenField from 'calypso/components/token-field';
import { useUpdateMonitorSettings } from '../../hooks';
import {
	availableNotificationDurations as durations,
	mobileAppLink,
} from '../../sites-overview/utils';
import type { MonitorSettings, Site } from '../../sites-overview/types';

import './style.scss';

type Duration = { label: string; time: number };

interface Props {
	sites: Array< Site >;
	onClose: () => void;
	settings?: MonitorSettings;
}

export default function NotificationSettings( { onClose, sites, settings }: Props ) {
	const translate = useTranslate();

	const sitesWithMonitorEnabled = sites.filter( ( site ) => site.monitor_settings.monitor_active );
	const sitesWithMonitorDisabled = sites.filter(
		( site ) => ! site.monitor_settings.monitor_active
	);

	// Filter out the sites with monitor disabled
	const { updateMonitorSettings, isLoading, isComplete } =
		useUpdateMonitorSettings( sitesWithMonitorEnabled );

	const defaultDuration = durations.find( ( duration ) => duration.time === 5 );

	const [ enableMobileNotification, setEnableMobileNotification ] = useState< boolean >( false );
	const [ enableEmailNotification, setEnableEmailNotification ] = useState< boolean >( false );
	const [ selectedDuration, setSelectedDuration ] = useState< Duration | undefined >(
		defaultDuration
	);
	const [ addedEmailAddresses, setAddedEmailAddresses ] = useState< string[] | [] >( [] );
	const [ validationError, setValidationError ] = useState< string >( '' );

	function onSave( event: React.FormEvent< HTMLFormElement > ) {
		event.preventDefault();
		if ( ! enableMobileNotification && ! enableEmailNotification ) {
			return setValidationError( translate( 'Please select at least one contact method.' ) );
		}
		if ( enableEmailNotification && ! addedEmailAddresses.length ) {
			return setValidationError( translate( 'Please add at least one email recipient' ) );
		}
		const params = {
			wp_note_notifications: enableMobileNotification,
			email_notifications: enableEmailNotification,
			jetmon_defer_status_down_minutes: selectedDuration?.time,
		};
		updateMonitorSettings( params );
	}

	function selectDuration( duration: Duration ) {
		setSelectedDuration( duration );
	}

	useEffect( () => {
		if ( settings?.monitor_deferment_time ) {
			const foundDuration = durations.find(
				( duration ) => duration.time === settings.monitor_deferment_time
			);
			foundDuration && setSelectedDuration( foundDuration );
		}
	}, [ settings?.monitor_deferment_time ] );

	useEffect( () => {
		if ( settings?.monitor_notify_users_emails ) {
			setAddedEmailAddresses( settings.monitor_notify_users_emails );
			setEnableEmailNotification( true );
		}
	}, [ settings?.monitor_notify_users_emails ] );

	useEffect( () => {
		if ( enableMobileNotification || enableEmailNotification ) {
			setValidationError( '' );
		}
	}, [ enableMobileNotification, enableEmailNotification ] );

	function handleAddEmail( recipients: Array< string > ) {
		if ( recipients.length ) {
			setValidationError( '' );
			recipients.forEach( ( recipient ) => {
				if ( ! emailValidator.validate( recipient ) ) {
					setValidationError( translate( 'Please enter a valid email address.' ) );
				}
			} );
		}
		setAddedEmailAddresses( recipients );
	}
	useEffect( () => {
		if ( isComplete ) {
			onClose();
		}
	}, [ isComplete, onClose ] );

	const addEmailsContent = enableEmailNotification && (
		<div className="notification-settings__email-container">
			<TokenField
				tokenizeOnSpace
				placeholder={ translate( 'Enter email addresses' ) }
				value={ addedEmailAddresses }
				onChange={ handleAddEmail }
			/>
			<div className="notification-settings__email-condition">
				{ translate( 'Separate with commas or the Enter key.' ) }
			</div>
		</div>
	);

	const getSiteCountTitle = ( sites: Array< Site > ) => {
		if ( sites.length === 1 ) {
			return sites[ 0 ].url;
		}
		return translate( '%(siteCount)d sites', {
			args: { siteCount: sites.length },
			comment: '%(siteCount) is no of sites selected, e.g. "2 sites"',
		} );
	};

	// Hide the form content if all sites have monitor disabled
	const hideFormContent = sites.length === sitesWithMonitorDisabled.length;

	return (
		<Modal
			open={ true }
			onRequestClose={ onClose }
			title={ translate( 'Set custom notification' ) }
			className="notification-settings__modal"
		>
			<div className="notification-settings__sub-title">{ getSiteCountTitle( sites ) }</div>
			{ sitesWithMonitorDisabled.length > 0 && (
				<div className="notification-settings__warning">
					<Gridicon icon="info-outline" size={ 18 } />
					{ sitesWithMonitorDisabled.length > 1
						? translate(
								'Monitor is not enabled for %(siteCountText)s, and custom notifications can be set for sites that have monitor enabled',
								{
									args: { siteCountText: getSiteCountTitle( sitesWithMonitorDisabled ) },
									comment: "%(siteCountText) is no of sites, e.g. '2 sites'",
								}
						  )
						: translate(
								'Monitor is not enabled for {{em}}%(siteUrl)s{{/em}}, and custom notifications can be set for sites that have monitor enabled',
								{
									args: { siteUrl: getSiteCountTitle( sitesWithMonitorDisabled ) },
									components: {
										em: <em />,
									},
								}
						  ) }
				</div>
			) }

			<form onSubmit={ onSave }>
				{ ! hideFormContent && (
					<div className="notification-settings__content">
						<div className="notification-settings__content-block">
							<div className="notification-settings__content-heading">
								{ translate( 'Notify me about downtime:' ) }
							</div>
							<SelectDropdown
								selectedIcon={
									<img
										className="notification-settings__duration-icon"
										src={ clockIcon }
										alt={ translate( 'Schedules' ) }
									/>
								}
								selectedText={ selectedDuration?.label }
							>
								{ durations.map( ( duration ) => (
									<SelectDropdown.Item
										key={ duration.time }
										selected={ duration.time === selectedDuration?.time }
										onClick={ () => selectDuration( duration ) }
									>
										{ duration.label }
									</SelectDropdown.Item>
								) ) }
							</SelectDropdown>
						</div>
						<div className="notification-settings__toggle-container">
							<div className="notification-settings__toggle">
								<ToggleControl
									onChange={ setEnableMobileNotification }
									checked={ enableMobileNotification }
								/>
							</div>
							<div className="notification-settings__toggle-content">
								<div className="notification-settings__content-heading">
									{ translate( 'Mobile' ) }
								</div>
								<div className="notification-settings__content-sub-heading">
									{ translate( 'Receive notifications via the {{a}}Jetpack App{{/a}}.', {
										components: {
											a: (
												<a
													className="notification-settings__link"
													target="_blank"
													rel="noreferrer"
													href={ mobileAppLink }
												/>
											),
										},
									} ) }
								</div>
							</div>
						</div>
						<div className="notification-settings__toggle-container">
							<div className="notification-settings__toggle">
								<ToggleControl
									onChange={ setEnableEmailNotification }
									checked={ enableEmailNotification }
								/>
							</div>
							<div className="notification-settings__toggle-content">
								<div className="notification-settings__content-heading">
									{ translate( 'Email' ) }
								</div>
								<div className="notification-settings__content-sub-heading">
									{ translate( 'Receive email notifications with one or more recipients.' ) }
								</div>
								{
									// We are using CSS to hide/show add email content on mobile/large screen view instead of the breakpoint
									// hook since the 'useMobileBreakpont' hook returns true only when the width is > 480px, and we have some
									// styles applied using the CSS breakpoint where '@include break-mobile' is true for width > 479px
								 }
								<div className="notification-settings__large-screen">{ addEmailsContent }</div>
							</div>
						</div>
						<div className="notification-settings__small-screen">{ addEmailsContent }</div>
					</div>
				) }
				<div className="notification-settings__footer">
					{ validationError && ! hideFormContent && (
						<div className="notification-settings__footer-validation-error">
							{ validationError }
						</div>
					) }
					<div className="notification-settings__footer-buttons">
						{ hideFormContent ? (
							<Button
								onClick={ onClose }
								aria-label={ translate( 'Close notification settings popup' ) }
							>
								{ translate( 'Close' ) }
							</Button>
						) : (
							<>
								<Button
									onClick={ onClose }
									aria-label={ translate( 'Cancel and close notification settings popup' ) }
								>
									{ translate( 'Cancel' ) }
								</Button>
								<Button
									disabled={ !! validationError || isLoading }
									type="submit"
									primary
									aria-label={ translate( 'Save notification settings' ) }
								>
									{ isLoading ? translate( 'Saving Changes' ) : translate( 'Save' ) }
								</Button>
							</>
						) }
					</div>
				</div>
			</form>
		</Modal>
	);
}
