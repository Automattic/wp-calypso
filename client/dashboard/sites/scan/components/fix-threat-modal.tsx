import { __experimentalVStack as VStack, Button } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useEffect } from 'react';
import { useAnalytics } from '../../../app/analytics';
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

	const { recordTracksEvent } = useAnalytics();
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );

	const { startFix, isFixing, status, error } = useFixThreats( site.ID, threatIds );

	const isExtensionDeleteFixer =
		threat.signature === 'Vulnerable.WP.Extension' && threat.fixable?.fixer === 'delete';

	useEffect( () => {
		if ( isExtensionDeleteFixer ) {
			recordTracksEvent( 'calypso_dashboard_scan_fix_threat_confirmation_modal_open' );
		} else {
			recordTracksEvent( 'calypso_dashboard_scan_fix_threat_modal_open' );
		}
	}, [ recordTracksEvent, isExtensionDeleteFixer ] );

	useEffect( () => {
		if ( status.isComplete && ! isFixing ) {
			closeModal?.();

			if ( status.allFixed ) {
				recordTracksEvent( 'calypso_dashboard_scan_fix_threat_success' );
				createSuccessNotice( __( 'Threat fixed.' ), { type: 'snackbar' } );
			} else {
				recordTracksEvent( 'calypso_dashboard_scan_fix_threat_failed' );
				createErrorNotice( __( 'Failed to fix threat. Please contact support.' ), {
					type: 'snackbar',
				} );
			}
		}
	}, [ status, isFixing, closeModal, createSuccessNotice, createErrorNotice, recordTracksEvent ] );

	useEffect( () => {
		if ( error ) {
			closeModal?.();
			createErrorNotice( __( 'Failed to fix threat. Please contact support.' ), {
				type: 'snackbar',
			} );
		}
	}, [ error, closeModal, createErrorNotice ] );

	const handleFixThreat = () => {
		recordTracksEvent( 'calypso_dashboard_scan_fix_threat_click' );
		startFix();
	};

	return (
		<VStack spacing={ 4 }>
			<Text variant="muted">{ __( 'Jetpack will be fixing the following threat:' ) }</Text>
			<ThreatsDetailCard threats={ items } />

			{ isExtensionDeleteFixer ? (
				<>
					<ThreatDescription threat={ items[ 0 ] } site={ site } />
					<FixThreatConfirmation
						threat={ threat }
						onCancel={ closeModal }
						onConfirm={ handleFixThreat }
						disabled={ isFixing }
						isLoading={ isFixing }
					/>
				</>
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
