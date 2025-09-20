import {
	Button,
	__experimentalVStack as VStack,
	__experimentalText as Text,
	Icon,
} from '@wordpress/components';
import { Action } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { tool } from '@wordpress/icons';
import { ButtonStack } from '../../../components/button-stack';
import { IgnoreThreatModal } from '../../scan/components/ignore-threat-modal';
import { ThreatDescription } from '../../scan/components/threat-description';
import { ThreatsDetailCard } from '../../scan/components/threats-detail-card';
import type { Threat } from '@automattic/api-core';

export function getActions( siteId: number ): Action< Threat >[] {
	return [
		{
			id: 'fix',
			isPrimary: true,
			icon: <Icon icon={ tool } />,
			label: __( 'Fix threat' ),
			modalHeader: __( 'Fix threat' ),
			supportsBulk: true,
			RenderModal: ( { items, closeModal } ) => {
				const fixButtonLabel = items.length === 1 ? __( 'Fix threat' ) : __( 'Fix all threats' );
				const description =
					items.length === 1
						? __( 'Jetpack will be fixing the following threat:' )
						: __( 'Jetpack will be fixing the following threats:' );

				return (
					<VStack spacing={ 4 }>
						<Text variant="muted">{ description }</Text>
						<ThreatsDetailCard threats={ items } />
						<ThreatDescription threat={ items[ 0 ] } />
						<ButtonStack justify="flex-end">
							<Button variant="tertiary" onClick={ closeModal }>
								{ __( 'Cancel' ) }
							</Button>
							{ /* @TODO: implement the auto-fix threat action and remove the disabled prop */ }
							<Button variant="primary" disabled>
								{ fixButtonLabel }
							</Button>
						</ButtonStack>
					</VStack>
				);
			},
			isEligible: ( threat: Threat ) => !! threat.fixable,
		},
		{
			id: 'ignore',
			label: __( 'Ignore threat' ),
			modalHeader: __( 'Ignore threat' ),
			supportsBulk: false,
			RenderModal: ( { items, closeModal, onActionPerformed } ) => (
				<IgnoreThreatModal
					items={ items }
					closeModal={ closeModal }
					onActionPerformed={ onActionPerformed }
					siteId={ siteId }
				/>
			),
		},
	];
}
