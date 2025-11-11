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

function PropagationStatusIndicator( { propagated }: { propagated: boolean } ) {
	return (
		<span
			style={ {
				width: '8px',
				height: '8px',
				borderRadius: '50%',
				backgroundColor: propagated ? '#048015' : '#dcdcde',
			} }
			aria-label={ propagated ? __( 'Propagated' ) : __( 'Not propagated' ) }
			role="status"
		/>
	);
}

function formatLastUpdated( lastUpdated: string ): string {
	// Handle empty or null-like values
	if ( ! lastUpdated || typeof lastUpdated !== 'string' ) {
		return '';
	}

	try {
		const date = new Date( lastUpdated );

		// Check if date is valid (new Date() can return Invalid Date without throwing)
		if ( isNaN( date.getTime() ) ) {
			return '';
		}

		const formattedTime = date.toLocaleTimeString( undefined, {
			hour: 'numeric',
			minute: '2-digit',
			hour12: true,
		} );

		// Additional check in case toLocaleTimeString returns unexpected result
		if ( ! formattedTime || formattedTime === 'Invalid Date' ) {
			return '';
		}

		return formattedTime;
	} catch ( error ) {
		// Log error in development for debugging
		if ( process.env.NODE_ENV === 'development' ) {
			// eslint-disable-next-line no-console
			console.warn( 'Failed to format date:', lastUpdated, error );
		}
		return '';
	}
}

export default function DomainPropagationStatus( { domainName }: { domainName: string } ) {
	const { data, isLoading, isError } = useQuery( domainPropagationStatusQuery( domainName ) );

	if ( isError || isLoading || ! data ) {
		return null;
	}

	return (
		<VStack spacing={ 4 }>
			<Text size="medium" weight={ 500 }>
				{ __( 'Global propagation status' ) }
			</Text>
			<Card className="domain-propagation-status">
				<CardBody>
					<Grid columns={ 3 } gap={ 4 }>
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
				{ __( 'Last checked at' ) } { formatLastUpdated( data.last_updated ) }
			</Text>
		</VStack>
	);
}
