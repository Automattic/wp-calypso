import { TitanControlPanelContext } from '@automattic/api-core';
import { domainQuery, titanControlPanelAutoLoginUrlMutation } from '@automattic/api-queries';
import { useMutation, useQuery } from '@tanstack/react-query';
import { __experimentalVStack as VStack, Icon, Spinner } from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { useDispatch } from '@wordpress/data';
import { __, sprintf } from '@wordpress/i18n';
import { cloudUpload, desktop, login, mobile, settings, tool } from '@wordpress/icons';
import { store as noticesStore } from '@wordpress/notices';
import { useState } from 'react';
import { useAnalytics } from '../../app/analytics';
import Notice from '../../components/notice';
import SummaryButton from '../../components/summary-button';
import { SummaryButtonList } from '../../components/summary-button-list';
import { Text } from '../../components/text';

const GENERIC_CONTEXT_KEY = 'control_panel';

interface ControlPanelLink {
	context?: TitanControlPanelContext;
	icon: React.ComponentProps< typeof Icon >[ 'icon' ];
	title: string;
	description: string;
	/**
	 * Titan's control panel has no usable layout on small screens, so the sections
	 * that require real interaction are only offered on larger viewports.
	 */
	requiresLargeViewport?: boolean;
}

function getControlPanelLinks(): ControlPanelLink[] {
	return [
		{
			icon: tool,
			title: __( 'Open control panel' ),
			description: __( 'Reset passwords, configure DKIM, and access every Titan setting' ),
		},
		{
			context: TitanControlPanelContext.CONFIGURE_DESKTOP_APP,
			icon: desktop,
			title: __( 'Configure desktop app' ),
			description: __( 'View settings required to configure third-party email apps' ),
			requiresLargeViewport: true,
		},
		{
			context: TitanControlPanelContext.GET_MOBILE_APP,
			icon: mobile,
			title: __( 'Get mobile app' ),
			description: __( "Download Titan's Android and iOS apps to access your emails on the go" ),
		},
		{
			context: TitanControlPanelContext.IMPORT_EMAIL_DATA,
			icon: cloudUpload,
			title: __( 'Import email data' ),
			description: __( 'Migrate existing emails from a remote server via IMAP' ),
			requiresLargeViewport: true,
		},
		{
			context: TitanControlPanelContext.CONFIGURE_CATCH_ALL_EMAIL,
			icon: settings,
			title: __( 'Configure catch-all email' ),
			description: __( 'Route all undelivered emails to your domain to a specific mailbox' ),
			requiresLargeViewport: true,
		},
		{
			context: TitanControlPanelContext.CONFIGURE_INTERNAL_FORWARDING,
			icon: login,
			title: __( 'Set up internal forwarding' ),
			description: __( 'Create email aliases that forward messages to one or several mailboxes' ),
			requiresLargeViewport: true,
		},
	];
}

/**
 * Replicates the classic Calypso "Manage all mailboxes" page
 * (/email/:domain/titan/manage-mailboxes/:site) for the dashboard: a list of
 * deep links into Titan's control panel, each resolved through a single-use
 * auto-login URL so the user does not need an admin mailbox to sign in.
 */
export default function TitanControlPanelModal( { domainName }: { domainName: string } ) {
	const isLargeViewport = useViewportMatch( 'large' );
	const { recordTracksEvent } = useAnalytics();
	const { createErrorNotice } = useDispatch( noticesStore );
	const [ pendingContext, setPendingContext ] = useState< string | null >( null );

	const { data: domain, isLoading: isLoadingDomain } = useQuery( domainQuery( domainName ) );
	const { mutateAsync: fetchAutoLoginUrl } = useMutation( titanControlPanelAutoLoginUrlMutation() );

	const orderId = domain?.titan_mail_subscription?.order_id;
	const hasSubscription = ! isLoadingDomain && !! orderId;
	const isPending = pendingContext !== null;

	const handleClick = async ( link: ControlPanelLink ) => {
		if ( ! orderId || isPending ) {
			return;
		}

		const contextKey = link.context ?? GENERIC_CONTEXT_KEY;
		recordTracksEvent( 'calypso_dashboard_emails_titan_control_panel_link_click', {
			context: contextKey,
		} );

		// Opened up front so the tab stays attributable to this click; browsers
		// block window.open() once the auto-login request has resolved.
		const controlPanelWindow = window.open( '', '_blank' );
		setPendingContext( contextKey );

		try {
			const url = await fetchAutoLoginUrl( { orderId, context: link.context } );
			if ( controlPanelWindow ) {
				controlPanelWindow.location.href = url;
			} else {
				window.location.href = url;
			}
		} catch {
			controlPanelWindow?.close();
			createErrorNotice(
				__( 'We could not open the control panel. Please try again in a few minutes.' ),
				{ type: 'snackbar' }
			);
		} finally {
			setPendingContext( null );
		}
	};

	return (
		<VStack spacing={ 4 }>
			<Text>
				{ sprintf(
					/* translators: %s is a domain name, e.g. example.com */
					__(
						'Manage every mailbox on %s from Titan’s control panel. Each option opens in a new tab.'
					),
					domainName
				) }
			</Text>

			{ ! isLoadingDomain && ! orderId && (
				<Notice variant="error">
					{ __( 'We could not find an active Professional Email subscription for this domain.' ) }
				</Notice>
			) }

			{ ! isLargeViewport && (
				<Notice variant="warning">
					{ __(
						'Please switch to a device with a larger screen to access all email management features.'
					) }
				</Notice>
			) }

			<SummaryButtonList density="medium-low">
				{ getControlPanelLinks().map( ( link ) => {
					const contextKey = link.context ?? GENERIC_CONTEXT_KEY;
					const isDisabled =
						! hasSubscription || isPending || ( link.requiresLargeViewport && ! isLargeViewport );

					return (
						<SummaryButton
							key={ contextKey }
							title={ link.title }
							description={ link.description }
							decoration={
								pendingContext === contextKey ? <Spinner /> : <Icon icon={ link.icon } />
							}
							disabled={ isDisabled }
							onClick={ () => handleClick( link ) }
						/>
					);
				} ) }
			</SummaryButtonList>
		</VStack>
	);
}
