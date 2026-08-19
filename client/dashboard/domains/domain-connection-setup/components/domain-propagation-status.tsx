import { domainPropagationStatusQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import {
	__experimentalText as Text,
	__experimentalHStack as HStack,
	__experimentalGrid as Grid,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { Card, CardBody, CardDivider } from '../../../components/card';
import { useTimeSince } from '../../../components/time-since';
import type { DomainConnectionStatus } from '../utils';

function PropagationStatusIndicator( { propagated }: { propagated: boolean } ) {
	return (
		<span
			style={ {
				width: '8px',
				height: '8px',
				borderRadius: '50%',
				backgroundColor: propagated ? 'var(--dashboard__foreground-color-success)' : '#dcdcde',
			} }
			aria-label={ propagated ? __( 'Propagated' ) : __( 'Not propagated' ) }
			role="status"
		/>
	);
}

export default function DomainPropagationStatus( {
	domainName,
	status = 'connecting',
}: {
	domainName: string;
	status?: DomainConnectionStatus;
} ) {
	const { data, isLoading, isError } = useQuery( domainPropagationStatusQuery( domainName ) );
	const lastChecked = useTimeSince( data?.last_updated ?? '' );

	if ( isError || isLoading || ! data ) {
		return null;
	}

	return (
		<VStack spacing={ 4 }>
			<Text size="medium" weight={ 500 }>
				{ __( 'Global propagation status' ) }
			</Text>
			<Card>
				<CardBody>
					<Grid gap={ 4 } style={ { gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))' } }>
						{ data.propagation_status.map( ( area ) => (
							<HStack key={ area.area_code } spacing={ 2 } justify="flex-start">
								<PropagationStatusIndicator
									propagated={
										status === 'active' || ( status === 'connecting' && area.propagated )
									}
								/>
								<Text>{ area.area_name }</Text>
							</HStack>
						) ) }
					</Grid>
				</CardBody>
				{ status !== 'active' && (
					<>
						<CardDivider />
						<CardBody>
							<Text variant="muted" size={ 12 }>
								{ status === 'verifying'
									? __( 'Propagation begins once verification is complete.' )
									: sprintf(
											// translators: %s is the time the status was last checked
											__( 'Last checked %s' ),
											lastChecked
									  ) }
							</Text>
						</CardBody>
					</>
				) }
			</Card>
		</VStack>
	);
}
