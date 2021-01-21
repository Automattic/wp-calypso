import { useState, useEffect } from 'react'
import { ExperimentAssignment } from 'explat-client/src/types'
import { ExPlatClient } from 'explat-client/src/create-explat-client'

interface ExPlatReactClient {
    /**
     * An ExPlat useExperiment hook.
     *
     * NOTE: Doesn't obey ExperimentAssignment TTL, that would be bad for UX.
     *
     * @returns [isExperimentAssignmentLoading, ExperimentAssignment | null]
     */
    useExperiment: (experimentName: string) => [boolean, ExperimentAssignment | null]
}

export default function createExPlatReactClient(ExPlatClient: ExPlatClient): ExPlatReactClient {
    return {
        useExperiment: (experimentName: string) => {
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
            });

            return [isLoading, experimentAssignment];
        }
    }
}