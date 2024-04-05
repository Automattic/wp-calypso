import loadActivityRoutes from './activity/routes';
import loadScanRoutes from './scan/routes';

export function JetpackFeatureRoutes( basePath: string ) {
	loadScanRoutes( basePath );
	loadActivityRoutes();
}
