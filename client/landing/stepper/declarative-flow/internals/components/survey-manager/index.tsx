import { isNewSiteMigrationFlow } from '@automattic/onboarding';
import { Suspense } from 'react';
import AsyncMigrationSurvey from '../../steps-repository/components/migration-survey/async';
import { DeferredRender } from '../deferred-render';
import type { Flow, FlowV2 } from '../../types';

const SurveyManager = ( {
	disabled = false,
	flow,
}: {
	disabled?: boolean;
	flow?: Flow | FlowV2< any >;
} ) => {
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
