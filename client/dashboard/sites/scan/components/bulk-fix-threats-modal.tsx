import { __experimentalVStack as VStack, Button } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { __, _n } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useEffect } from 'react';
import { ButtonStack } from '../../../components/button-stack';
import { Text } from '../../../components/text';
import { useFixThreats } from '../hooks/use-fix-threats';
import { ThreatsDetailCard } from './threats-detail-card';
import type { Threat, Site } from '@automattic/api-core';
import type { RenderModalProps } from '@wordpress/dataviews';

interface BulkFixThreatsModalProps extends RenderModalProps< Threat > {
	site: Site;
}

export function BulkFixThreatsModal( { items, closeModal, site }: BulkFixThreatsModalProps ) {
	const bulkFixableThreats = items.filter(
		( item ) => item.fixable?.extras?.is_bulk_fixable !== false
	);
	const bulkFixableIds = new Set( bulkFixableThreats.map( ( item ) => item.id ) );
	const remainingThreats = items.filter( ( item ) => ! bulkFixableIds.has( item.id ) );

	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );

	const { startFix, isFixing, status, error } = useFixThreats(
		site.ID,
		Array.from( bulkFixableIds )
	);

	useEffect( () => {
		if ( status.isComplete && ! isFixing ) {
			closeModal?.();

			if ( status.allFixed ) {
				createSuccessNotice(
					_n( 'Threat fixed.', 'All threats were successfully fixed.', bulkFixableThreats.length ),
					{
						type: 'snackbar',
					}
				);
			} else {
				createErrorNotice(
					_n(
						'Failed to fix threat. Please contact support.',
						'Not all threats could be fixed. Please contact support.',
						bulkFixableThreats.length
					),
					{
						type: 'snackbar',
					}
				);
			}
		}
	}, [
		status,
		isFixing,
		closeModal,
		createSuccessNotice,
		createErrorNotice,
		bulkFixableThreats.length,
	] );

	useEffect( () => {
		if ( error ) {
			closeModal?.();
			createErrorNotice(
				_n(
					'Error fixing threat. Please contact support.',
					'Error fixing threats. Please contact support.',
					bulkFixableThreats.length
				),
				{
					type: 'snackbar',
				}
			);
		}
	}, [ error, closeModal, createErrorNotice, bulkFixableThreats.length ] );

	const handleFixThreats = () => {
		startFix();
	};

	const bulkFixableSection = (
		<>
			<Text variant="muted">
				{ _n(
					'Jetpack will be fixing the selected threat and low risk item:',
					'Jetpack will be fixing the selected threats and low risk items:',
					bulkFixableThreats.length
				) }
			</Text>
			<ThreatsDetailCard threats={ bulkFixableThreats } />
		</>
	);

	const remainingThreatsSection = (
		<>
			<Text variant="muted">
				{ _n(
					'This threat cannot be fixed in bulk because individual confirmation is required:',
					'These threats cannot be fixed in bulk because individual confirmation is required:',
					remainingThreats.length
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
					{ isFixing
						? _n( 'Fixing threat…', 'Fixing threats…', bulkFixableThreats.length )
						: _n( 'Fix threat', 'Fix all threats', bulkFixableThreats.length ) }
				</Button>
			</ButtonStack>
		</VStack>
	);
}
