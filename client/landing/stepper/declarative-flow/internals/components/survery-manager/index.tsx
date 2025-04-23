import { SITE_MIGRATION_FLOW } from '@automattic/onboarding';
import { Suspense } from 'react';
import AsyncMigrationSurvey from '../../steps-repository/components/migration-survey/async';
import { Flow } from '../../types';
import { DeferredRender } from '../deferred-render';

const MIGRATION_FLOWS = new Set< string >( [ SITE_MIGRATION_FLOW ] );

const SurveyManager = ( { disabled = false, flow }: { disabled?: boolean; flow?: Flow } ) => {
	if ( disabled || ! flow || ! MIGRATION_FLOWS.has( flow.name ) ) {
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
