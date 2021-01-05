import { recordTracksEvent } from 'calypso/lib/analytics/tracks'
import { getAnonIdFromCookie } from 'calypso/state/experiments/reducer'
import { createExPlatClient, createExPlatReactClient } from 'explat-client'

const makeRequest = () => {
    // TODO
    return
}

let hasTracksEventFiredToEnsureAnonIdInCookie = false
const getAnonId = () => {
    if (!hasTracksEventFiredToEnsureAnonIdInCookie) {
		recordTracksEvent( 'calypso_explat_first_experiment_fetch' );
    }
    return getAnonIdFromCookie()
}

const logError = (errorMessage) => {
    // TODO Logstashing
    return
}

const isDevelopmentMode = process.env.NODE_ENV || process.env.NODE_ENV === 'development'

const ExPlatClient = createExPlatClient(
    makeRequest,
    getAnonId,
    logError,
    isDevelopmentMode,
)

const ExPlatReactClient = createExPlatReactClient(ExPlatClient)

export { 
    ExPlatClient.loadExperimentAssignment as loadExperimentAssignment
    ExPlatReactClient.useExperiment as useExperiment
}