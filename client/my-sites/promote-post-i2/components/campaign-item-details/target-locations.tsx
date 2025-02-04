import { useTranslate } from 'i18n-calypso';
import { FC } from 'react';
import { AudienceList } from 'calypso/data/promote-post/types';

interface Props {
	audienceList?: AudienceList;
}

const TargetLocations: FC< Props > = ( { audienceList } ) => {
	const translate = useTranslate();
	const isUsingNewGeoLocationData = !! audienceList && 'cities' in audienceList; // We didn't sent this field in the previous model

	const { cities: citiesList, states: statesList, regions, countries } = audienceList || {};

	let regionsList = isUsingNewGeoLocationData ? regions : countries; // Old campaigns used Continents, instead of countries/regions. I will put those under regions now.
	const countriesList = isUsingNewGeoLocationData ? countries : '';

	if ( ! citiesList && ! statesList && ! regionsList && ! countriesList ) {
		regionsList = translate( 'Everywhere' );
	}

	return (
		<>
			{ citiesList && (
				<span>
					{
						/* translators: %s: list of cities (i.e. New York, Florida City) */
						translate( '{{i}}Cities:{{/i}} %(citiesList)s', {
							args: { citiesList },
							components: { i: <i /> },
						} )
					}
				</span>
			) }
			{ statesList && (
				<span>
					{
						/* translators: %s: list of states (i.e. New York, Florida) */
						translate( '{{i}}States:{{/i}} %(statesList)s', {
							args: { statesList },
							components: { i: <i /> },
						} )
					}
				</span>
			) }
			{ countriesList && (
				<span>
					{
						/* translators: %s: list of countries (i.e. United States, Germany) */
						translate( '{{i}}Countries:{{/i}} %(countriesList)s', {
							args: { countriesList },
							components: { i: <i /> },
						} )
					}
				</span>
			) }
			{ regionsList && (
				<span>
					{
						/* translators: %s: list of regions (i.e. Scotland, Toscana) */
						translate( '{{i}}Regions:{{/i}} %(regionsList)s', {
							args: { regionsList },
							components: { i: <i /> },
						} )
					}
				</span>
			) }
		</>
	);
};

export default TargetLocations;
