import { JetpackFeatureContexts } from './jetpack/jetpack-contexts';

export function FeatureContexts( basePath: string ) {
	// Load all the context families
	JetpackFeatureContexts( basePath );

	// Todo: Example of other feature contexts
	//OverviewFeatureContexts();
	//SecurityFeatureContexts();
}
