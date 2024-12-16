import getTrackingPrefs from '@automattic/calypso-analytics/src/utils/get-tracking-prefs';
import { useIsEnglishLocale } from '@automattic/i18n-utils';
import {
	MIGRATION_FLOW,
	SITE_MIGRATION_FLOW,
	HOSTED_SITE_MIGRATION_FLOW,
	MIGRATION_SIGNUP_FLOW,
} from '@automattic/onboarding';
import { Suspense } from 'react';
import { useFlowNavigation } from '../../hooks/use-flow-navigation';
import AsyncMigrationSurvey from '../../steps-repository/components/migration-survey/async';

const MIGRATION_SURVEY_FLOWS = [
	MIGRATION_FLOW,
	SITE_MIGRATION_FLOW,
	HOSTED_SITE_MIGRATION_FLOW,
	MIGRATION_SIGNUP_FLOW,
];

const SurveyManager = () => {
	const { params } = useFlowNavigation();
	const isEnLocale = useIsEnglishLocale();
	const { ok } = getTrackingPrefs();

	// Skip survey for non-English locales
	if ( ! isEnLocale ) {
		return null;
	}

	if ( ! params.flow ) {
		return null;
	}

	if ( ! MIGRATION_SURVEY_FLOWS.includes( params.flow ) ) {
		return null;
	}

	if ( ! ok ) {
		return null;
	}

	return (
		<Suspense>
			<AsyncMigrationSurvey />
		</Suspense>
	);
};

export default SurveyManager;
