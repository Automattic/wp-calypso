import { domainPropagationStatusQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import {
	__experimentalText as Text,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { __ } from '@wordpress/i18n';
import { Card, CardBody } from '../../../components/card';
import Grid from '../../../components/grid';
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
	const isSmallViewport = useViewportMatch( 'medium', '<' );

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
					<Grid
						templateColumns={ `repeat( ${ Math.max(
							1,
							Math.min( data.propagation_status.length, isSmallViewport ? 2 : 4 )
						) }, auto )` }
						gap="lg"
						style={ { justifyContent: 'space-between' } }
					>
						{ data.propagation_status.map( ( area ) => (
							<HStack key={ area.area_code } spacing={ 2 } justify="flex-start" expanded={ false }>
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
