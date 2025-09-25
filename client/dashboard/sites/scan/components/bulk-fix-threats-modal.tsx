import {
	fixThreatsMutation,
	fixThreatsStatusQuery,
	siteScanQuery,
	siteScanHistoryQuery,
} from '@automattic/api-queries';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { __experimentalVStack as VStack, Button } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useState, useEffect, useCallback } from 'react';
import { ButtonStack } from '../../../components/button-stack';
import { Text } from '../../../components/text';
import { ThreatsDetailCard } from './threats-detail-card';
import type { Threat } from '@automattic/api-core';
import type { RenderModalProps } from '@wordpress/dataviews';

interface BulkFixThreatsModalProps extends RenderModalProps< Threat > {
	siteId: number;
}

export function BulkFixThreatsModal( { items, closeModal, siteId }: BulkFixThreatsModalProps ) {
	const bulkFixableThreats = items.filter(
		( item ) => item.fixable?.extras?.is_bulk_fixable !== false
	);
	const bulkFixableIds = new Set( bulkFixableThreats.map( ( item ) => item.id ) );
	const remainingThreats = items.filter( ( item ) => ! bulkFixableIds.has( item.id ) );

	const queryClient = useQueryClient();
	const bulkFixThreats = useMutation( fixThreatsMutation( siteId ) );
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );
	const [ isBulkFixInProgress, setIsBulkFixInProgress ] = useState( false );

	const { data: bulkFixStatusData } = useQuery( {
		...fixThreatsStatusQuery( siteId, Array.from( bulkFixableIds ) ),
		refetchInterval: isBulkFixInProgress ? 2000 : false,
		enabled: isBulkFixInProgress,
	} );

	const handleBulkFixed = useCallback(
		( message: string ) => {
			queryClient.invalidateQueries( siteScanQuery( siteId ) );
			queryClient.invalidateQueries( siteScanHistoryQuery( siteId ) );
			closeModal?.();
			createSuccessNotice( message, { type: 'snackbar' } );
		},
		[ closeModal, createSuccessNotice, queryClient, siteId ]
	);

	useEffect( () => {
		if ( ! bulkFixStatusData?.threats ) {
			return;
		}

		if ( isBulkFixInProgress ) {
			const pendingThreats = bulkFixStatusData.threats.filter(
				( threat ) => threat?.status === 'in_progress'
			);
			if ( pendingThreats.length > 0 ) {
				return;
			}

			const fixedThreats = bulkFixStatusData.threats.filter(
				( threat ) => threat?.status === 'fixed'
			);
			const allFixed = fixedThreats.length === bulkFixStatusData.threats.length;
			const message = allFixed
				? __( 'All threats were successfully fixed.' )
				: __( 'Not all threats could be fixed. Please contact our support.' );

			setIsBulkFixInProgress( false );
			handleBulkFixed( message );
		}
	}, [ bulkFixStatusData, isBulkFixInProgress, handleBulkFixed ] );

	const handleFixThreats = () => {
		setIsBulkFixInProgress( true );
		bulkFixThreats.mutate( Array.from( bulkFixableIds ), {
			onError: () => {
				closeModal?.();
				createErrorNotice( __( 'Error fixing threats. Please contact support.' ), {
					type: 'snackbar',
				} );
			},
		} );
	};

	const bulkFixableSection = (
		<>
			<Text variant="muted">
				{ __( 'Jetpack will be fixing the selected threats and low risk items:' ) }
			</Text>
			<ThreatsDetailCard threats={ bulkFixableThreats } />
		</>
	);

	const remainingThreatsSection = (
		<>
			<Text variant="muted">
				{ __(
					'These threats cannot be fixed in bulk because individual confirmation is required:'
				) }
			</Text>
			<ThreatsDetailCard threats={ remainingThreats } />
		</>
	);

	const canBulkFix = bulkFixableThreats.length > 0;

	return (
		<VStack spacing={ 4 }>
			{ canBulkFix && bulkFixableSection }
			{ remainingThreats.length > 0 && remainingThreatsSection }
			<ButtonStack justify="flex-end">
				<Button variant="tertiary" onClick={ closeModal }>
					{ __( 'Cancel' ) }
				</Button>
				<Button
					variant="primary"
					onClick={ handleFixThreats }
					isBusy={ isBulkFixInProgress }
					disabled={ ! canBulkFix || isBulkFixInProgress }
				>
					{ isBulkFixInProgress ? __( 'Fixing threats…' ) : __( 'Fix all threats' ) }
				</Button>
			</ButtonStack>
		</VStack>
	);
}
