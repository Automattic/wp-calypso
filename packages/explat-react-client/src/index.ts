import { useState, useEffect } from 'react'

import type { ExPlatClient, ExperimentAssignment } from '@automattic/explat-client'

interface ExPlatReactClient {
    /**
     * An ExPlat useExperiment hook.
     *
     * NOTE: Doesn't obey ExperimentAssignment TTL in order to keep stable UX.
     *
     * @returns [isExperimentAssignmentLoading, ExperimentAssignment | null]
     */
    useExperiment: (experimentName: string) => [boolean, ExperimentAssignment | null]
}

export default function createExPlatReactClient(ExPlatClient: ExPlatClient): ExPlatReactClient {
    return {
        useExperiment: (experimentName: string) => {
            const [previousExperimentName] = useState(experimentName)
            const [isLoading, setIsLoading] = useState<boolean>(true);
            const [
                experimentAssignment,
                setExperimentAssignment,
            ] = useState<ExperimentAssignment | null>(null);

            useEffect(() => {
                let isSubscribed = true;
                ExPlatClient.loadExperimentAssignment(experimentName).then((experimentAssignment) => {
                    if (isSubscribed) {
                        setExperimentAssignment(experimentAssignment);
                        setIsLoading(false);
                    }
                });
                return () => {
                    isSubscribed = false;
                };
            }, []);

            if (experimentName !== previousExperimentName) {
                const message = '[ExPlat] useExperiment: experimentName should never change between renders!'
                if ( ExPlatClient.internalUseOnlyIsDevelopmentMode ) {
                    throw new Error(message)
                } 
                ExPlatClient.internalUseOnlyLogError({ message })
            }

            return [isLoading, experimentAssignment];
        }
    }
}