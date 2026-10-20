import { tipaltiIFrameUrlQuery, tipaltiPayeeQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import {
	Button,
	__experimentalHeading as Heading,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { Card, CardBody } from '../../../components/card';
import { Text } from '../../../components/text';
import tipaltiMark from '../../crossover/images/tipalti.svg';
import { leaveDashboard } from '../../crossover/store';
import { getAccountStatus } from './get-account-status';

function getSummary( statusType: 'success' | 'warning' | 'error' | undefined ) {
	switch ( statusType ) {
		case 'success':
			return {
				title: __( 'Your payout details are with Tipalti' ),
				text: __(
					'Tipalti, our payments partner, has your bank details and tax form. You can update them there at any time.'
				),
			};
		case 'error':
			return {
				title: __( 'Your payout account needs attention' ),
				text: __( 'Open Tipalti, our payments partner, to see what your account needs.' ),
			};
		default:
			return {
				title: __( 'Add your bank details and tax form' ),
				text: __( 'Enter them in Tipalti, our payments partner, to start receiving payments.' ),
			};
	}
}

/**
 * Payout settings as its own page: the payment status and what it means here,
 * and Tipalti, which holds the form, one click away in a new tab.
 */
export function TipaltiPayoutSummary( { agencyId }: { agencyId: number } ) {
	const { data: payee } = useQuery( tipaltiPayeeQuery( agencyId ) );
	const { data: iframeData } = useQuery( {
		...tipaltiIFrameUrlQuery( agencyId ),
		refetchOnWindowFocus: false,
	} );
	const tipaltiUrl = iframeData?.iframe_url;
	const accountStatus = getAccountStatus( payee );
	const { title, text } = getSummary( accountStatus?.statusType );

	return (
		<Card>
			<CardBody>
				<HStack spacing={ 6 } alignment="center" justify="space-between" wrap>
					<VStack spacing={ 2 } className="earn-payout-settings-summary">
						<img className="earn-payout-settings-tipalti" src={ tipaltiMark } alt="Tipalti" />
						<Heading level={ 2 } size={ 15 } weight={ 500 } lineHeight="24px">
							{ title }
						</Heading>
						<Text variant="muted">{ text }</Text>
					</VStack>
					<Button
						__next40pxDefaultSize
						variant={ accountStatus?.actionRequired === false ? 'secondary' : 'primary' }
						disabled={ ! tipaltiUrl }
						onClick={ () => tipaltiUrl && leaveDashboard( 'tipalti', tipaltiUrl ) }
					>
						<HStack justify="flex-start" spacing={ 1 } expanded={ false }>
							<span>{ __( 'Open Tipalti' ) }</span>
							<span aria-label={ __( '(opens in a new tab)' ) }>&#8599;</span>
						</HStack>
					</Button>
				</HStack>
			</CardBody>
		</Card>
	);
}
