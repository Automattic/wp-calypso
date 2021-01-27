/**
 * WordPress dependencies
 */
import wpcom from 'calypso/lib/wp';
import { createExPlatClient } from 'explat-client'


/**
 * Internal dependecies
 */
import { recordTracksEvent } from 'calypso/lib/analytics/tracks'
import { getAnonIdFromCookie } from 'calypso/state/experiments/reducer'

const logError = (errorMessage: string) => {
    // TODO: Severity? Move this into the client?
    const error = {
        exPlatStandaloneClient: 'calypso',
        message: errorMessage,
    }

    const body = new window.FormData();
    body.append( 'error', JSON.stringify(error) );

    try {
        window.fetch( 'https://public-api.wordpress.com/rest/v1.1/js-error', {
            method: 'POST',
            body,
        } );
    } catch {
        // eslint-disable-next-line no-console
        console.error( 'Error: Unable to record the error in Logstash.' );
    }
    return
}

const fetchExperimentAssignment = ({experimentName, anonId} : { experimentName: string, anonId?: string }): Promise< unknown > => {
    return wpcom.req.get(
        '/v2/experiments/0.1.0/assignments/calypso', 
        {
            experiment_name: experimentName,
            anon_id: anonId ?? undefined,
        },
    )
}

let hasTracksEventFiredToEnsureAnonIdInCookie = false
const getAnonId = (): string | null => {
    if (typeof window === 'undefined') {
        logError('Trying to retrieve anonId outside of a browser context.')
        return null
    }

    if (!hasTracksEventFiredToEnsureAnonIdInCookie) {
		recordTracksEvent( 'calypso_explat_first_experiment_fetch' );
    }

    return getAnonIdFromCookie()
}

const isDevelopmentMode = process.env.NODE_ENV === 'development';

const ExPlatClient = createExPlatClient({
    fetchExperimentAssignment,
    getAnonId,
    logError,
    isDevelopmentMode,
});

export { 
    ExPlatClient.loadExperimentAssignment as loadExperimentAssignment,
    ExPlatClient.dangerouslyGetExperimentAssignment as dangerouslyGetExperimentAssignment
    // ExPlatReactClient.useExperiment as useExperiment
};