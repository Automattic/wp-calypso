import {
	__experimentalVStack as VStack,
	__experimentalText as Text,
	Button,
	ExternalLink,
} from '@wordpress/components';
import { Action } from '@wordpress/dataviews';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { ButtonStack } from '../../../components/button-stack';
import { Notice } from '../../../components/notice';
import { ThreatDescription } from '../../scan/components/threat-description';
import { ThreatsDetailCard } from '../../scan/components/threats-detail-card';
import { CODEABLE_JETPACK_SCAN_URL } from '../../scan/constants';
import type { Threat } from '@automattic/api-core';

export function getActions(): Action< Threat >[] {
	return [
		{
			id: 'unignore',
			isEligible: ( threat: Threat ) => threat.status === 'ignored',
			label: __( 'Unignore threat' ),
			modalHeader: __( 'Unignore threat' ),
			supportsBulk: false,
			RenderModal: ( { items, closeModal } ) => (
				<VStack spacing={ 4 }>
					<Text variant="muted">{ __( 'Jetpack will be unignoring the following threat:' ) }</Text>
					<ThreatsDetailCard threats={ items } />
					{ items.length === 1 && <ThreatDescription threat={ items[ 0 ] } /> }
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
						{ /* @TODO: implement the unignore threat action and remove the disabled prop */ }
						<Button variant="primary" disabled>
							{ __( 'Unignore threat' ) }
						</Button>
					</ButtonStack>
				</VStack>
			),
		},
		{
			id: 'view_details',
			isEligible: ( threat: Threat ) => threat.status !== 'ignored',
			label: __( 'View details' ),
			modalHeader: __( 'View threat details' ),
			supportsBulk: false,
			RenderModal: ( { items } ) => (
				<VStack spacing={ 4 }>
					<ThreatsDetailCard threats={ items } />
					<ThreatDescription threat={ items[ 0 ] } />
				</VStack>
			),
		},
	];
}
