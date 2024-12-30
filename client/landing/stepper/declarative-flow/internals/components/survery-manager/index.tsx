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
import { DeferredRender } from '../deferred-render';

const MIGRATION_SURVEY_FLOWS = [
	MIGRATION_FLOW,
	SITE_MIGRATION_FLOW,
	HOSTED_SITE_MIGRATION_FLOW,
	MIGRATION_SIGNUP_FLOW,
];

const SurveyManager = ( { disabled }: { disabled: boolean } ) => {
	const { params } = useFlowNavigation();
	const isEnLocale = useIsEnglishLocale();

	if ( ! params.flow || disabled ) {
		return null;
	}

	if ( MIGRATION_SURVEY_FLOWS.includes( params.flow ) && isEnLocale ) {
		return (
			<DeferredRender timeMs={ 2000 }>
				<Suspense>
					<AsyncMigrationSurvey />
				</Suspense>
			</DeferredRender>
		);
	}

	return null;
};

export default SurveyManager;
