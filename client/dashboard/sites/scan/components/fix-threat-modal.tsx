import { fixThreatMutation } from '@automattic/api-queries';
import { useMutation } from '@tanstack/react-query';
import { __experimentalVStack as VStack, Button } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { ButtonStack } from '../../../components/button-stack';
import { Text } from '../../../components/text';
import { ThreatDescription } from './threat-description';
import { ThreatsDetailCard } from './threats-detail-card';
import type { Threat } from '@automattic/api-core';
import type { RenderModalProps } from '@wordpress/dataviews';

interface FixThreatModalProps extends RenderModalProps< Threat > {
	siteId: number;
}

export function FixThreatModal( { items, closeModal, siteId }: FixThreatModalProps ) {
	const threat = items[ 0 ];

	const fixThreat = useMutation( fixThreatMutation( siteId ) );
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );

	const handleFixThreat = () => {
		fixThreat.mutate( threat.id, {
			onSuccess: () => {
				closeModal?.();
				createSuccessNotice(
					__(
						'We’re hard at work fixing this threat in the background. Please check back shortly.'
					),
					{ type: 'snackbar' }
				);
			},
			onError: () => {
				closeModal?.();
				createErrorNotice( __( 'Error fixing threat. Please contact support.' ), {
					type: 'snackbar',
				} );
			},
		} );
	};

	return (
		<VStack spacing={ 4 }>
			<Text variant="muted">{ __( 'Jetpack will be fixing the following threat:' ) }</Text>
			<ThreatsDetailCard threats={ items } />
			<ThreatDescription threat={ items[ 0 ] } />
			<ButtonStack justify="flex-end">
				<Button variant="tertiary" onClick={ closeModal }>
					{ __( 'Cancel' ) }
				</Button>
				<Button
					variant="primary"
					onClick={ handleFixThreat }
					isBusy={ fixThreat.isPending }
					disabled={ fixThreat.isPending }
				>
					{ __( 'Fix threat' ) }
				</Button>
			</ButtonStack>
		</VStack>
	);
}
