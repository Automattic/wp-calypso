import { useIsEnglishLocale } from '@automattic/i18n-utils';
import { SITE_MIGRATION_FLOW } from '@automattic/onboarding';
import { Suspense } from 'react';
import { useGeoLocationQuery } from 'calypso/data/geo/use-geolocation-query';
import AsyncMigrationSurvey from '../../steps-repository/components/migration-survey/async';
import { Flow } from '../../types';
import { DeferredRender } from '../deferred-render';

const migrationFlows = [ SITE_MIGRATION_FLOW ];
const availableCountries = [ 'US', 'IN' ];

const isMigrationSurveyAvailable = ( {
	country,
	flow,
	isEnglish,
}: {
	country?: string;
	flow?: string;
	isEnglish?: boolean;
} ) => {
	if ( ! country || ! flow || ! isEnglish ) {
		return false;
	}

	if ( ! migrationFlows.includes( flow ) ) {
		return false;
	}

	if ( ! availableCountries.includes( country ) ) {
		return false;
	}

	return true;
};

const surveyList = [
	{
		Component: AsyncMigrationSurvey,
		isAvailable: isMigrationSurveyAvailable,
	},
] as const;

const SurveyManager = ( { disabled = false, flow }: { disabled?: boolean; flow?: Flow } ) => {
	const isEnLocale = useIsEnglishLocale();
	const { data } = useGeoLocationQuery();
	const countryCode = data?.country_short;

	if ( ! flow || disabled || ! countryCode ) {
		return null;
	}

	const survey = surveyList.find( ( { isAvailable } ) =>
		isAvailable( {
			flow: flow?.variantSlug || flow?.name,
			country: countryCode,
			isEnglish: isEnLocale,
		} )
	);

	if ( ! survey ) {
		return null;
	}

	return (
		<DeferredRender timeMs={ 2000 }>
			<Suspense>
				<survey.Component countryCode={ countryCode } />
			</Suspense>
		</DeferredRender>
	);
};

export default SurveyManager;
