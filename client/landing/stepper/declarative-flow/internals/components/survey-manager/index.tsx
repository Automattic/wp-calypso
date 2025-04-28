import { isNewSiteMigrationFlow } from '@automattic/onboarding';
import { Suspense } from 'react';
import AsyncMigrationSurvey from '../../steps-repository/components/migration-survey/async';
import { Flow } from '../../types';
import { DeferredRender } from '../deferred-render';

const SurveyManager = ( { disabled = false, flow }: { disabled?: boolean; flow?: Flow } ) => {
	if ( disabled || ! flow || ! isNewSiteMigrationFlow( flow.name ) ) {
		return null;
	}

	return (
		<DeferredRender timeMs={ 2000 }>
			<Suspense>
				<AsyncMigrationSurvey />
			</Suspense>
		</DeferredRender>
	);
};

export default SurveyManager;
