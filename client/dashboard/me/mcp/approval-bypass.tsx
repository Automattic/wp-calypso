import { userSettingsMutation } from '@automattic/api-queries';
import { useLocale } from '@automattic/i18n-utils';
import { useMutation } from '@tanstack/react-query';
import { Icon, SelectControl, __experimentalVStack as VStack } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { unlock } from '@wordpress/icons';
import clsx from 'clsx';
import { isToday } from 'date-fns';
import { useState } from 'react';
import { useMcpTracksAudienceProps } from '../../../me/mcp/tracks';
import { useAnalytics } from '../../app/analytics';
import { withSnackbar } from '../../app/snackbars/with-snackbar';
import { CardBody } from '../../components/card';
import ConfirmModal from '../../components/confirm-modal';
import SummaryButton from '../../components/summary-button';
import { Text } from '../../components/text';
import { formatDate } from '../../utils/datetime';
import type { McpApprovalBypass, McpApprovalBypassDuration } from '@automattic/api-core';

import './approval-bypass.scss';

// Stands for "on with an expiry". The chosen duration is not stored, only when it ends.
const CURRENT_VALUE = 'current';

function getDurationLabels(): Record< McpApprovalBypassDuration, string > {
	return {
		off: __( 'Off' ),
		'30m': __( '30 minutes' ),
		'2h': __( '2 hours' ),
		'12h': __( '12 hours' ),
		forever: __( 'Until turned off' ),
	};
}

function getEndsText( duration: McpApprovalBypassDuration ) {
	switch ( duration ) {
		case '30m':
			return __( 'The bypass ends after 30 minutes, or when you turn it off.' );
		case '2h':
			return __( 'The bypass ends after 2 hours, or when you turn it off.' );
		case '12h':
			return __( 'The bypass ends after 12 hours, or when you turn it off.' );
		default:
			return __( 'The bypass stays on until you turn it off.' );
	}
}

export default function McpApprovalBypassControl( {
	approvalBypass,
}: {
	approvalBypass: McpApprovalBypass;
} ) {
	const locale = useLocale();
	const { recordTracksEvent } = useAnalytics();
	const tracksAudienceProps = useMcpTracksAudienceProps();
	const [ isOpen, setIsOpen ] = useState( false );
	const [ pendingDuration, setPendingDuration ] = useState< McpApprovalBypassDuration | null >(
		null
	);

	const mutation = useMutation(
		withSnackbar( userSettingsMutation(), {
			success: __( 'Settings saved.' ),
			error: __( 'Failed to save settings.' ),
		} )
	);

	const durationLabels = getDurationLabels();
	const expiresAt =
		approvalBypass.active && approvalBypass.expires_at
			? new Date( approvalBypass.expires_at * 1000 )
			: null;

	let value: string = 'off';
	let status = durationLabels.off;
	if ( expiresAt ) {
		value = CURRENT_VALUE;
		status = sprintf(
			/* translators: %s is the time, or date and time, when the permissions bypass turns off */
			__( 'On until %s' ),
			formatDate(
				expiresAt,
				locale,
				isToday( expiresAt ) ? { timeStyle: 'short' } : { dateStyle: 'medium', timeStyle: 'short' }
			)
		);
	} else if ( approvalBypass.active ) {
		value = 'forever';
		status = __( 'On until turned off' );
	}

	const options = [
		...( expiresAt ? [ { label: status, value: CURRENT_VALUE } ] : [] ),
		...( Object.entries( durationLabels ) as Array< [ McpApprovalBypassDuration, string ] > ).map(
			( [ duration, label ] ) => ( { label, value: duration } )
		),
	];

	const save = ( duration: McpApprovalBypassDuration ) => {
		mutation.mutate(
			{ mcp_approval_bypass: duration },
			{
				onSuccess: () => {
					setPendingDuration( null );
					recordTracksEvent( 'calypso_dashboard_mcp_approval_bypass_changed', {
						...tracksAudienceProps,
						duration,
					} );
				},
			}
		);
	};

	const handleChange = ( newValue: string ) => {
		if ( newValue === CURRENT_VALUE ) {
			return;
		}
		const duration = newValue as McpApprovalBypassDuration;
		if ( ! approvalBypass.active && duration !== 'off' ) {
			setPendingDuration( duration );
			return;
		}
		save( duration );
	};

	return (
		<div className={ clsx( 'mcp-approval-bypass', { 'is-open': isOpen } ) }>
			<SummaryButton
				density="medium"
				title={ __( 'Bypass permissions' ) }
				decoration={ <Icon icon={ unlock } size={ 24 } /> }
				badges={ [ { text: status, intent: approvalBypass.active ? 'medium' : 'draft' } ] }
				aria-expanded={ isOpen }
				onClick={ () => setIsOpen( ! isOpen ) }
			/>
			{ isOpen && (
				<CardBody>
					<SelectControl
						__next40pxDefaultSize
						__nextHasNoMarginBottom
						label={ __( 'Bypass permissions' ) }
						hideLabelFromVision
						help={ __(
							'Skip approval prompts and let your AI make changes without asking first.'
						) }
						value={ value }
						options={ options }
						disabled={ mutation.isPending }
						onChange={ handleChange }
					/>
				</CardBody>
			) }
			<ConfirmModal
				isOpen={ pendingDuration !== null }
				title={ __( 'Bypass permissions?' ) }
				__experimentalHideHeader={ false }
				onConfirm={ () => pendingDuration && save( pendingDuration ) }
				onCancel={ () => setPendingDuration( null ) }
				confirmButtonProps={ {
					label: __( 'Bypass permissions' ),
					isBusy: mutation.isPending,
					disabled: mutation.isPending,
				} }
			>
				<VStack spacing={ 3 }>
					<Text as="p">
						{ __(
							'AI agents connected to your account through MCP will make changes without asking you first. This applies to every connected MCP client. It doesn’t turn on abilities that are off in your MCP settings.'
						) }
					</Text>
					<Text as="p">
						{ __(
							'These still ask for approval: creating sites, permanent deletions, AI image generation, uninstalling plugins, deactivating plugins in bulk, making a site private, and DNS or nameserver changes. Actions on sites you aren’t a member of, and remote abilities, also still ask.'
						) }
					</Text>
					<Text as="p">{ pendingDuration && getEndsText( pendingDuration ) }</Text>
				</VStack>
			</ConfirmModal>
		</div>
	);
}
