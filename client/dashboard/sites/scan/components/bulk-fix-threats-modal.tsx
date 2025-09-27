import { __experimentalVStack as VStack, Button } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useEffect } from 'react';
import { ButtonStack } from '../../../components/button-stack';
import { Text } from '../../../components/text';
import { useFixThreats } from '../hooks/use-fix-threats';
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

	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );

	const { startFix, isFixing, status, error } = useFixThreats(
		siteId,
		Array.from( bulkFixableIds )
	);

	useEffect( () => {
		if ( status.isComplete && ! isFixing ) {
			closeModal?.();

			if ( status.allFixed ) {
				createSuccessNotice( __( 'All threats were successfully fixed.' ), { type: 'snackbar' } );
			} else {
				createErrorNotice( __( 'Not all threats could be fixed. Please contact our support.' ), {
					type: 'snackbar',
				} );
			}
		}
	}, [ status, isFixing, closeModal, createSuccessNotice, createErrorNotice ] );

	useEffect( () => {
		if ( error ) {
			closeModal?.();
			createErrorNotice( __( 'Error fixing threats. Please contact support.' ), {
				type: 'snackbar',
			} );
		}
	}, [ error, closeModal, createErrorNotice ] );

	const handleFixThreats = () => {
		startFix();
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
					isBusy={ isFixing }
					disabled={ ! canBulkFix || isFixing }
				>
					{ __( 'Fix all threats' ) }
				</Button>
			</ButtonStack>
		</VStack>
	);
}
