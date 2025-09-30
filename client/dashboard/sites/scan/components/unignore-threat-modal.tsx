import { unignoreThreatMutation } from '@automattic/api-queries';
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
import { ButtonStack } from '../../../components/button-stack';
import { Notice } from '../../../components/notice';
import { CODEABLE_JETPACK_SCAN_URL } from '../constants';
import { ThreatDescription } from './threat-description';
import { ThreatsDetailCard } from './threats-detail-card';
import type { Threat, Site } from '@automattic/api-core';
import type { RenderModalProps } from '@wordpress/dataviews';

interface UnignoreThreatModalProps extends RenderModalProps< Threat > {
	site: Site;
}

export function UnignoreThreatModal( { items, closeModal, site }: UnignoreThreatModalProps ) {
	const threat = items[ 0 ];
	const unignoreThreat = useMutation( unignoreThreatMutation( site.ID ) );
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );

	const handleUnignoreThreat = () => {
		unignoreThreat.mutate( threat.id, {
			onSuccess: () => {
				closeModal?.();
				createSuccessNotice( __( 'Threat unignored.' ), { type: 'snackbar' } );
			},
			onError: () => {
				closeModal?.();
				createErrorNotice( __( 'Failed to unignore threat. Please try again.' ), {
					type: 'snackbar',
				} );
			},
		} );
	};

	return (
		<VStack spacing={ 4 }>
			<Text variant="muted">{ __( 'Jetpack will be unignoring the following threat:' ) }</Text>
			<ThreatsDetailCard threats={ [ threat ] } />
			<ThreatDescription threat={ threat } site={ site } />
			<Notice variant="warning">
				{ createInterpolateElement(
					__(
						'By unignoring this threat you confirm that you have reviewed the detected code and assume the risks of keeping a potentially malicious file on your site as an active threat. If you are unsure please request an estimate with <codeable />.'
					),
					{
						codeable: <ExternalLink href={ CODEABLE_JETPACK_SCAN_URL }>Codeable</ExternalLink>,
					}
				) }
			</Notice>
			<ButtonStack justify="flex-end">
				<Button variant="tertiary" onClick={ closeModal }>
					{ __( 'Cancel' ) }
				</Button>
				<Button
					variant="primary"
					onClick={ handleUnignoreThreat }
					isBusy={ unignoreThreat.isPending }
					disabled={ unignoreThreat.isPending }
				>
					{ __( 'Unignore threat' ) }
				</Button>
			</ButtonStack>
		</VStack>
	);
}
