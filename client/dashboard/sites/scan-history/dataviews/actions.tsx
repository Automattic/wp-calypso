import {
	__experimentalVStack as VStack,
	__experimentalText as Text,
	Button,
} from '@wordpress/components';
import { Action } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { ButtonStack } from '../../../components/button-stack';
import { ThreatsDetailCard } from '../../scan/components/threats-detail-card';
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

					{ /* @TODO: render the proper threat description here */ }

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

					{ /* @TODO: render the proper threat description here */ }
				</VStack>
			),
		},
	];
}
