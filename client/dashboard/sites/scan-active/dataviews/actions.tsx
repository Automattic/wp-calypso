import {
	Button,
	__experimentalVStack as VStack,
	__experimentalText as Text,
	Icon,
	ExternalLink,
} from '@wordpress/components';
import { Action } from '@wordpress/dataviews';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { tool } from '@wordpress/icons';
import { ButtonStack } from '../../../components/button-stack';
import { Notice } from '../../../components/notice';
import { ThreatsDetailCard } from '../../scan/components/threats-detail-card';
import { CODEABLE_JETPACK_SCAN_URL } from '../../scan/constants';
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
				const description =
					items.length === 1
						? __( 'Jetpack will be fixing the following threat:' )
						: __( 'Jetpack will be fixing the following threats:' );

				return (
					<VStack spacing={ 4 }>
						<Text variant="muted">{ description }</Text>
						<ThreatsDetailCard threats={ items } />

						{ /* @TODO: render the proper threat description here */ }

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
			RenderModal: ( { items, closeModal } ) => (
				<VStack spacing={ 4 }>
					<Text variant="muted">{ __( 'Jetpack will be ignoring the following threat:' ) }</Text>
					<ThreatsDetailCard threats={ items } />

					{ /* @TODO: render the proper threat description here */ }

					<Notice variant="error">
						{ createInterpolateElement(
							__(
								'By ignoring this threat you confirm that you have reviewed the detected code and assume the risks of keeping a potentially malicious file on your site. If you are unsure please request an estimate with <codeable />.'
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
						{ /* @TODO: implement the ignore threat action and remove the disabled prop */ }
						<Button variant="primary" disabled>
							{ __( 'Ignore threat' ) }
						</Button>
					</ButtonStack>
				</VStack>
			),
		},
	];
}
