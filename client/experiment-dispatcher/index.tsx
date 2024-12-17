import { CurrentUser } from '@automattic/calypso-analytics/dist/types/utils/current-user';
import { AnyAction } from 'redux';
import { loadExperimentAssignment } from 'calypso/lib/explat';
import { initializeCurrentUser } from 'calypso/lib/user/shared-utils';
import '@automattic/calypso-polyfills';
import { createReduxStore } from 'calypso/state';
import { setCurrentUser } from 'calypso/state/current-user/actions';
import { getInitialState, getStateFromCache } from 'calypso/state/initial-state';
import initialReducer from 'calypso/state/reducer';
import { setStore } from 'calypso/state/redux-store';
import { experimentsCatalog } from './experiments';
import 'calypso/components/environment-badge/style.scss';

/**
 * Gets the experiment manifest by determining its slug from the URL then retrieving it from the catalog.
 */
const getManifestFromUrl = () => {
	const slug = window.location.pathname.split( '/' )[ 2 ] as keyof typeof experimentsCatalog;
	const experiment = slug in experimentsCatalog && experimentsCatalog[ slug ];
	if ( ! experiment ) {
		throw new Error( `Experiment with slug ${ slug } not found` );
	}
	return experiment;
};

window.AppBoot = async () => {
	/**
	 * Initialize the current user and the redux store. Some experiments may require the current user.
	 */
	const user = ( await initializeCurrentUser() ) as CurrentUser | false;
	if ( user ) {
		const userId = ( user as CurrentUser ).ID;

		const initialState = getInitialState( initialReducer, userId );
		const reduxStore = createReduxStore( initialState, initialReducer );
		setStore( reduxStore, getStateFromCache( userId ) );

		user && reduxStore.dispatch( setCurrentUser( user ) as unknown as AnyAction );
	}

	const experimentManifest = getManifestFromUrl();

	try {
		const assignment = await loadExperimentAssignment( experimentManifest.experiment_explat_id );

		// Redirect to control for null assignment.
		if ( ! assignment.variationName ) {
			window.location.replace( experimentManifest.variants[ 'control' ].url );
			return;
		}

		if ( ! ( assignment.variationName in experimentManifest.variants ) ) {
			alert(
				`Variation ${ assignment.variationName } not found in experiment ${ experimentManifest.title }`
			);
			window.location.replace( experimentManifest.variants[ 'control' ].url );
			return;
		}

		// Redirect to treatment.
		window.location.replace( experimentManifest.variants[ assignment.variationName ].url );
	} catch ( e ) {
		// In case anything goes wrong, don't leave users stranded and go to control.
		window.location.replace( experimentManifest.variants[ 'control' ].url );
	}
};
