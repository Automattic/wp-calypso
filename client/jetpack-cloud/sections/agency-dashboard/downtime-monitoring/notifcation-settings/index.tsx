import { Button } from '@automattic/components';
import { Modal, ToggleControl } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useMemo, useState } from 'react';
import clockIcon from 'calypso/assets/images/jetpack/clock-icon.svg';
import SelectDropdown from 'calypso/components/select-dropdown';
import TokenField from 'calypso/components/token-field';
import type { MonitorSettings } from '../../sites-overview/types';

import './style.scss';

type Duration = { label: string; time: number };

interface Props {
	site: { blog_id: number; url: string };
	onClose: () => void;
	settings: MonitorSettings | undefined;
}

export default function NotificationSettings( { onClose, site, settings }: Props ) {
	const translate = useTranslate();

	const [ enableMobileNotification, setEnablMobileNotification ] = useState< boolean >( false );
	const [ enableEmailNotification, setEnableEmailNotification ] = useState< boolean >( false );
	const [ selectedDuration, setSelectedDuration ] = useState< Duration | undefined >( undefined );
	const [ addedEmailAddresses, setAddedEmailAddresses ] = useState< string[] | [] >( [] );

	const mobileAppLink = 'https://jetpack.com/blog/jetpack-mobile-app/';

	function onSave( event: React.FormEvent< HTMLFormElement > ) {
		event.preventDefault();
		// handle save here
	}

	function selectDuration( duration: Duration ) {
		setSelectedDuration( duration );
	}

	const durations = useMemo(
		() => [
			{
				time: 1,
				label: translate( 'After 1 minute' ),
			},
			{
				time: 5,
				label: translate( 'After 5 minutes' ),
			},
			{
				time: 15,
				label: translate( 'After 15 minutes' ),
			},
			{
				time: 30,
				label: translate( 'After 30 minutes' ),
			},
			{
				time: 45,
				label: translate( 'After 45 minutes' ),
			},
			{
				time: 60,
				label: translate( 'After 1 hour' ),
			},
		],
		[ translate ]
	);

	useEffect( () => {
		if ( settings?.monitor_deferment_time ) {
			const foundDuration = durations.find(
				( duration ) => duration.time === settings.monitor_deferment_time
			);
			foundDuration && setSelectedDuration( foundDuration );
		}
	}, [ durations, settings?.monitor_deferment_time ] );

	useEffect( () => {
		if ( settings?.monitor_notify_users_emails ) {
			setAddedEmailAddresses( settings.monitor_notify_users_emails );
			setEnableEmailNotification( true );
		}
	}, [ settings?.monitor_notify_users_emails ] );

	const addEmailsContent = enableEmailNotification && (
		<div className="notification-settings__email-container">
			<TokenField
				placeholder="Enter Email IDs"
				value={ addedEmailAddresses }
				onChange={ setAddedEmailAddresses }
			/>
			<div className="notification-settings__email-condition">
				{ translate( 'Separate with commas or the Enter key.' ) }
			</div>
		</div>
	);

	return (
		<Modal
			open={ true }
			onRequestClose={ onClose }
			title={ translate( 'Set custom notification' ) }
			shouldCloseOnClickOutside={ false }
			className="notification-settings__modal"
		>
			<div className="notification-settings__sub-title">{ site.url }</div>
			<form onSubmit={ onSave }>
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
									alt="Durations"
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
								onChange={ setEnablMobileNotification }
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
							<div className="notification-settings__content-heading">{ translate( 'Email' ) }</div>
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
				<div className="notification-settings__footer">
					<Button
						onClick={ onClose }
						aria-label={ translate( 'Cancel and close notification settings popup' ) }
					>
						{ translate( 'Cancel' ) }
					</Button>
					<Button type="submit" primary aria-label={ translate( 'Save notification settings' ) }>
						{ translate( 'Save' ) }
					</Button>
				</div>
			</form>
		</Modal>
	);
}
