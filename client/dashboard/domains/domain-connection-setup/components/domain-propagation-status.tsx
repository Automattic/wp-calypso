import { domainPropagationStatusQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import {
	__experimentalText as Text,
	__experimentalHStack as HStack,
	__experimentalGrid as Grid,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { Card, CardBody } from '../../../components/card';
import { useTimeSince } from '../../../components/time-since';

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

export default function DomainPropagationStatus( { domainName }: { domainName: string } ) {
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
					<Grid columns={ 4 } gap={ 4 }>
						{ data.propagation_status.map( ( area ) => (
							<HStack key={ area.area_code } spacing={ 2 } justify="flex-start">
								<PropagationStatusIndicator propagated={ area.propagated } />
								<Text>{ area.area_name }</Text>
							</HStack>
						) ) }
					</Grid>
				</CardBody>
			</Card>
			<Text variant="muted" size={ 12 }>
				{ /* translators: %s is the time the status was last checked */ }
				{ __( 'Last checked' ) } { lastChecked }
			</Text>
		</VStack>
	);
}
