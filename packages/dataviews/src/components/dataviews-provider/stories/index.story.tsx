/**
 * WordPress dependencies
 */
import { createInterpolateElement } from '@wordpress/element';
import {
	Card,
	CardHeader,
	CardBody,
	__experimentalHeading as Heading,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __, _n } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import DataViewsProvider from '../index';
import { data, type SpaceObject } from '../../dataviews/stories/fixtures';

const meta = {
	title: 'DataViews/DataViewsProvider',
	component: null,
};

export default meta;

/**
 * Custom composition example
 */
function PlanetOverview( { data }: { data: SpaceObject[] } ) {
	const planets = data.filter( ( item ) =>
		item.categories.includes( 'Planet' )
	);
	const moons = planets.reduce( ( sum, item ) => sum + item.satellites, 0 );

	return (
		<Card isBorderless style={ { padding: '12px 24px' } }>
			<CardHeader>
				<Heading level={ 2 }>{ __( 'Solar System numbers' ) }</Heading>
			</CardHeader>

			<CardBody>
				<VStack spacing={ 2 }>
					<Text size={ 18 } as="p">
						{ createInterpolateElement(
							_n(
								'<PlanetsNumber /> planet',
								'<PlanetsNumber /> planets',
								planets.length
							),
							{
								PlanetsNumber: (
									<strong>{ planets.length } </strong>
								),
							}
						) }
					</Text>

					<Text size={ 18 } as="p">
						{ createInterpolateElement(
							_n(
								'<SatellitesNumber /> moon',
								'<SatellitesNumber /> moons',
								moons
							),
							{
								SatellitesNumber: <strong>{ moons } </strong>,
							}
						) }
					</Text>
				</VStack>
			</CardBody>
		</Card>
	);
}

export const FreeComposition = () => {
	return (
		<DataViewsProvider< SpaceObject > data={ data }>
			<PlanetOverview data={ data } />
		</DataViewsProvider>
	);
};
