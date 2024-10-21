import { lazy } from 'react';

const AsyncMigrationSurvey = lazy( () => import( './index' ) );

export default AsyncMigrationSurvey;
