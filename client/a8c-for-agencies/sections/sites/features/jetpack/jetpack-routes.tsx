import loadActivityRoutes from './activity/routes';
import loadBackupRoutes from './backup/routes';
import loadScanRoutes from './scan/routes';

export function JetpackFeatureRoutes( basePath: string ) {
	loadScanRoutes( basePath );
	loadBackupRoutes( basePath );
	loadActivityRoutes();
}
