import { ignoreThreatMutation } from '@automattic/api-queries';
import { useMutation } from '@tanstack/react-query';
import {
	Button,
	__experimentalVStack as VStack,
	__experimentalText as Text,
	ExternalLink,
} from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useEffect } from 'react';
import { useAnalytics } from '../../../app/analytics';
import { ButtonStack } from '../../../components/button-stack';
import { Notice } from '../../../components/notice';
import { CODEABLE_JETPACK_SCAN_URL } from '../constants';
import { ThreatDescription } from './threat-description';
import { ThreatsDetailCard } from './threats-detail-card';
import type { Threat, Site } from '@automattic/api-core';
import type { RenderModalProps } from '@wordpress/dataviews';

interface IgnoreThreatModalProps extends RenderModalProps< Threat > {
	site: Site;
}

export function IgnoreThreatModal( { items, closeModal, site }: IgnoreThreatModalProps ) {
	const threat = items[ 0 ];

	const { recordTracksEvent } = useAnalytics();
	const ignoreThreat = useMutation( ignoreThreatMutation( site.ID ) );
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );

	useEffect( () => {
		recordTracksEvent( 'calypso_dashboard_scan_ignore_threat_modal_open' );
	}, [ recordTracksEvent ] );

	const handleIgnoreThreat = () => {
		recordTracksEvent( 'calypso_dashboard_scan_ignore_threat_click' );
		ignoreThreat.mutate( threat.id, {
			onSuccess: () => {
				closeModal?.();
				recordTracksEvent( 'calypso_dashboard_scan_ignore_threat_success' );
				createSuccessNotice( __( 'Threat ignored.' ), { type: 'snackbar' } );
			},
			onError: () => {
				closeModal?.();
				recordTracksEvent( 'calypso_dashboard_scan_ignore_threat_failed' );
				createErrorNotice( __( 'Failed to ignore threat. Please try again.' ), {
					type: 'snackbar',
				} );
			},
		} );
	};

	const handleCodeableClick = () => {
		recordTracksEvent( 'calypso_dashboard_scan_codeable_estimate_click' );
	};

	return (
		<VStack spacing={ 4 }>
			<Text variant="muted">{ __( 'Jetpack will be ignoring the following threat:' ) }</Text>
			<ThreatsDetailCard threats={ [ threat ] } />
			<ThreatDescription threat={ threat } site={ site } />
			<Notice variant="error">
				{ createInterpolateElement(
					__(
						'By ignoring this threat you confirm that you have reviewed the detected code and assume the risks of keeping a potentially malicious file on your site. If you are unsure please request an estimate with <codeable />.'
					),
					{
						codeable: (
							<ExternalLink href={ CODEABLE_JETPACK_SCAN_URL } onClick={ handleCodeableClick }>
								Codeable
							</ExternalLink>
						),
					}
				) }
			</Notice>
			<ButtonStack justify="flex-end">
				<Button variant="tertiary" onClick={ closeModal }>
					{ __( 'Cancel' ) }
				</Button>
				<Button
					variant="primary"
					onClick={ handleIgnoreThreat }
					isBusy={ ignoreThreat.isPending }
					disabled={ ignoreThreat.isPending }
				>
					{ __( 'Ignore threat' ) }
				</Button>
			</ButtonStack>
		</VStack>
	);
}
