import {
	Button,
	Modal,
	TextControl,
	__experimentalVStack as VStack,
	__experimentalText as Text,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useState } from 'react';
import { useAnalytics } from '../../../app/analytics';
import { ButtonStack } from '../../../components/button-stack';
import { getA4APluginInstallUrl, getJetpackConnectUrl } from './lib';
import type { ConnectSiteAction } from './types';

interface Connection {
	title: string;
	description: string;
	submitLabel: string;
	trackEventName: string;
	getUrl: ( site: string ) => string | null;
}

function getConnection( action: ConnectSiteAction ): Connection {
	if ( action === 'a4a-connection' ) {
		return {
			title: __( 'Add a site by remotely installing the Automattic for Agencies client plugin' ),
			description: __(
				'This lightweight plugin securely connects your clients’ sites to the Automattic for Agencies Sites Dashboard, enabling you to manage them from one place and to be notified immediately if any site is experiencing security or performance issues.'
			),
			submitLabel: __( 'Connect' ),
			trackEventName: 'calypso_dashboard_agency_sites_add_site_via_a4a_plugin_click',
			getUrl: getA4APluginInstallUrl,
		};
	}

	return {
		title: __( 'Add a site by remotely installing the Jetpack plugin' ),
		description: __(
			'The Jetpack plugin lets you easily connect your clients’ sites to Automattic for Agencies. We’ll remotely install Jetpack for you on the site, and it will appear here.'
		),
		submitLabel: __( 'Install Jetpack' ),
		trackEventName: 'calypso_dashboard_agency_sites_add_site_via_jetpack_plugin_click',
		getUrl: getJetpackConnectUrl,
	};
}

interface ConnectSiteModalProps {
	action: ConnectSiteAction;
	onClose: () => void;
}

/**
 * Collects a site URL and hands the agency off to that site's plugin installer,
 * or to Jetpack connect, in a new tab. Nothing is connected from here; the site
 * shows up in the dashboard once the remote install completes.
 */
export default function ConnectSiteModal( { action, onClose }: ConnectSiteModalProps ) {
	const { recordTracksEvent } = useAnalytics();
	const [ site, setSite ] = useState( '' );

	const { title, description, submitLabel, trackEventName, getUrl } = getConnection( action );
	const url = getUrl( site );

	const onSubmit = ( event: React.FormEvent ) => {
		event.preventDefault();

		if ( ! url ) {
			return;
		}

		recordTracksEvent( trackEventName, { site: site.trim() } );
		window.open( url, '_blank', 'noreferrer' );
		onClose();
	};

	return (
		<Modal title={ title } onRequestClose={ onClose } size="medium">
			<form onSubmit={ onSubmit }>
				<VStack spacing={ 4 }>
					<Text variant="muted" as="p">
						{ description }
					</Text>
					<TextControl
						__next40pxDefaultSize
						__nextHasNoMarginBottom
						label={ __( 'What site do you want to connect?' ) }
						placeholder={ __( 'Site URL' ) }
						value={ site }
						onChange={ setSite }
					/>
					<ButtonStack justify="flex-end">
						<Button variant="tertiary" __next40pxDefaultSize onClick={ onClose }>
							{ __( 'Cancel' ) }
						</Button>
						<Button variant="primary" type="submit" __next40pxDefaultSize disabled={ ! url }>
							{ submitLabel }
						</Button>
					</ButtonStack>
				</VStack>
			</form>
		</Modal>
	);
}
