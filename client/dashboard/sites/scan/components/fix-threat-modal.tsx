import { __experimentalVStack as VStack, Button } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useEffect } from 'react';
import { ButtonStack } from '../../../components/button-stack';
import { Text } from '../../../components/text';
import { useFixThreats } from '../hooks/use-fix-threats';
import { FixThreatConfirmation } from './fix-threat-confirmation';
import { ThreatDescription } from './threat-description';
import { ThreatsDetailCard } from './threats-detail-card';
import type { Threat, Site } from '@automattic/api-core';
import type { RenderModalProps } from '@wordpress/dataviews';

interface FixThreatModalProps extends RenderModalProps< Threat > {
	site: Site;
}

export function FixThreatModal( { items, closeModal, site }: FixThreatModalProps ) {
	const threat = items[ 0 ];
	const threatIds = [ threat.id ];

	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );

	const { startFix, isFixing, status, error } = useFixThreats( site.ID, threatIds );

	useEffect( () => {
		if ( status.isComplete && ! isFixing ) {
			closeModal?.();

			if ( status.allFixed ) {
				createSuccessNotice( __( 'Threat fixed.' ), { type: 'snackbar' } );
			} else {
				createErrorNotice( __( 'Failed to fix threat. Please contact support.' ), {
					type: 'snackbar',
				} );
			}
		}
	}, [ status, isFixing, closeModal, createSuccessNotice, createErrorNotice ] );

	useEffect( () => {
		if ( error ) {
			closeModal?.();
			createErrorNotice( __( 'Failed to fix threat. Please contact support.' ), {
				type: 'snackbar',
			} );
		}
	}, [ error, closeModal, createErrorNotice ] );

	const handleFixThreat = () => {
		startFix();
	};

	const isExtensionDeleteFixer =
		threat.signature === 'Vulnerable.WP.Extension' && threat.fixable?.fixer === 'delete';

	return (
		<VStack spacing={ 4 }>
			<Text variant="muted">{ __( 'Jetpack will be fixing the following threat:' ) }</Text>
			<ThreatsDetailCard threats={ items } />

			{ isExtensionDeleteFixer ? (
				<FixThreatConfirmation
					threat={ threat }
					onCancel={ closeModal }
					onConfirm={ handleFixThreat }
					disabled={ isFixing }
					isLoading={ isFixing }
				/>
			) : (
				<>
					<ThreatDescription threat={ items[ 0 ] } site={ site } />
					<ButtonStack justify="flex-end">
						<Button variant="tertiary" onClick={ closeModal }>
							{ __( 'Cancel' ) }
						</Button>
						<Button
							variant="primary"
							onClick={ handleFixThreat }
							isBusy={ isFixing }
							disabled={ isFixing }
						>
							{ isFixing ? __( 'Fixing threat…' ) : __( 'Fix threat' ) }
						</Button>
					</ButtonStack>
				</>
			) }
		</VStack>
	);
}
