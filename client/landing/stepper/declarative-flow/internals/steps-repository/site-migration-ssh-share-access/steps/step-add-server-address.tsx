import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { FC, ReactNode } from 'react';
import FormTextInput from 'calypso/components/forms/form-text-input';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { AccordionNotice } from '../components/accordion-notice';
import { useVerifySSHConnection } from '../hooks/use-verify-ssh-connection';
import { validatePort } from '../utils/validation';

interface StepAddServerAddressProps {
	siteId: number;
	serverAddress: string;
	port: number;
	hostDisplayName?: string;
	helpLink: ReactNode;
	onServerAddressChange: ( address: string ) => void;
	onPortChange: ( port: number ) => void;
	onVerify: () => void;
	isInputDisabled: boolean;
}

export const StepAddServerAddress: FC< StepAddServerAddressProps > = ( {
	siteId,
	serverAddress,
	port,
	hostDisplayName,
	helpLink,
	onServerAddressChange,
	onPortChange,
	onVerify,
	isInputDisabled,
} ) => {
	const translate = useTranslate();

	const { mutate: verifyConnection, isPending, error } = useVerifySSHConnection();

	const handleVerify = () => {
		recordTracksEvent( 'calypso_site_migration_ssh_action', {
			step: 'add-server-address',
			action: 'click_button',
			button: 'verify_server',
		} );
		verifyConnection(
			{
				siteId,
				serverAddress,
				port,
			},
			{
				onSuccess: () => {
					onVerify();
				},
			}
		);
	};

	const canVerify =
		serverAddress.length > 0 && validatePort( port ) && ! isPending && ! isInputDisabled;

	const instructionText = hostDisplayName
		? translate(
				"We'll use your server address to securely connect and copy your site. You can find it in your %(currentHost)s SSH settings.",
				{
					args: { currentHost: hostDisplayName },
				}
		  )
		: translate(
				"We'll use your server address to securely connect and copy your site. You can find it in your hosting provider's SSH settings."
		  );

	return (
		<div>
			<p>{ instructionText }</p>

			{ helpLink }

			{ error && (
				<AccordionNotice variant="error">
					{ translate(
						'We ran into a problem connecting to your server. Please check your details and try again.'
					) }
				</AccordionNotice>
			) }

			<div className="migration-site-ssh__step-add-server-address-form">
				<div className="migration-site-ssh__step-add-server-address-server-address-field">
					<label
						htmlFor="ssh-server-address"
						className="migration-site-ssh__step-add-server-address-label"
					>
						{ translate( 'Server address' ) }
					</label>
					<FormTextInput
						id="ssh-server-address"
						value={ serverAddress }
						onChange={ ( e: React.ChangeEvent< HTMLInputElement > ) =>
							onServerAddressChange( e.target.value )
						}
						placeholder="ssh.wp.example-host.net"
						disabled={ isInputDisabled }
					/>
				</div>

				<div className="migration-site-ssh__step-add-server-address-port-field">
					<label htmlFor="ssh-port" className="migration-site-ssh__step-add-server-address-label">
						{ translate( 'Port' ) }
					</label>
					<FormTextInput
						id="ssh-port"
						type="number"
						value={ String( port ) }
						onChange={ ( e: React.ChangeEvent< HTMLInputElement > ) => {
							const parsedPort = parseInt( e.target.value, 10 );
							const newPort = Number.isNaN( parsedPort ) ? 22 : parsedPort;
							onPortChange( newPort );
						} }
						disabled={ isInputDisabled }
					/>
				</div>
			</div>

			<p className="migration-site-ssh__step-add-server-address-note">
				{ translate( 'This may be different than your website address.' ) }
			</p>

			<Button
				variant="primary"
				onClick={ handleVerify }
				disabled={ ! canVerify }
				isBusy={ isPending }
			>
				{ translate( 'Verify server address' ) }
			</Button>
		</div>
	);
};
