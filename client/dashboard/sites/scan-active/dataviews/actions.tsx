import {
	__experimentalText as Text,
	Icon,
	Button,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { Action } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { tool } from '@wordpress/icons';
import { ButtonStack } from '../../../components/button-stack';
import { Notice } from '../../../components/notice';
import { ThreatDescription } from '../../scan/components/threat-description';
import { ThreatsDetailCard } from '../../scan/components/threats-detail-card';
import type { Threat } from '@automattic/api-core';

export function getActions(): Action< Threat >[] {
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
				return (
					<VStack spacing={ 4 }>
						<Text variant="muted">{ __( 'Jetpack will be fixing the following threats:' ) }</Text>
						<ThreatsDetailCard threats={ items } />

						{ items.length === 1 && <ThreatDescription threat={ items[ 0 ] } /> }

						<ButtonStack justify="flex-end">
							<Button variant="tertiary" onClick={ closeModal }>
								{ __( 'Cancel' ) }
							</Button>
							{ /* @TODO: implement the auto-fix threat action */ }
							<Button variant="primary">{ fixButtonLabel }</Button>
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
			RenderModal: ( { items, closeModal } ) => {
				return (
					<VStack spacing={ 4 }>
						<Text variant="muted">{ __( 'Jetpack will ignore the following threat:' ) }</Text>
						<ThreatsDetailCard threats={ items } />
						<Notice variant="error">
							{ __(
								'By ignoring this threat you confirm that you have reviewed the detected code and assume the risks of keeping a potentially malicious file on your site. If you are unsure please request an estimate with Codeable.'
							) }
						</Notice>
						<ButtonStack justify="flex-end">
							<Button variant="tertiary" onClick={ closeModal }>
								{ __( 'Cancel' ) }
							</Button>
							{ /* @TODO: implement the ignore threat action */ }
							<Button variant="primary">{ __( 'Ignore threat' ) }</Button>
						</ButtonStack>
					</VStack>
				);
			},
		},
		{
			id: 'view_details',
			label: __( 'View details' ),
			modalHeader: __( 'Active threat' ),
			supportsBulk: false,
			// @TODO: render the proper details modal
			RenderModal: ( { items } ) => <p>Details of thread { items[ 0 ].id }</p>,
		},
	];
}
