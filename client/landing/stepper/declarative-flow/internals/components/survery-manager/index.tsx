import { SITE_MIGRATION_FLOW } from '@automattic/onboarding';
import { type ComponentType, Suspense } from 'react';
import AsyncMigrationSurvey from '../../steps-repository/components/migration-survey/async';
import { Flow } from '../../types';
import { DeferredRender } from '../deferred-render';

const FLOW_SURVEYS = new Map< string, ComponentType >( [
	[ SITE_MIGRATION_FLOW, AsyncMigrationSurvey ],
] );

const SurveyManager = ( { disabled = false, flow }: { disabled?: boolean; flow?: Flow } ) => {
	if ( disabled || ! flow ) {
		return null;
	}

	const SurveyComponent = FLOW_SURVEYS.get( flow.name );

	if ( ! SurveyComponent ) {
		return null;
	}

	return (
		<DeferredRender timeMs={ 2000 }>
			<Suspense>
				<SurveyComponent />
			</Suspense>
		</DeferredRender>
	);
};

export default SurveyManager;
