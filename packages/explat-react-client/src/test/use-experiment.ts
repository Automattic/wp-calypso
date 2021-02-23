import type { ExPlatClient, ExperimentAssignment } from '@automattic/explat-client'
import {renderHook, act} from '@testing-library/react-hooks'
import { validExperimentAssignment } from '@automattic/explat-client/src/internal/test-common'

import createExPlatReactClient from '../index'


const createMockExPlatClient = (isDevelopmentMode: boolean = false): ExPlatClient => ({
    loadExperimentAssignment: jest.fn(),
    dangerouslyGetExperimentAssignment: jest.fn(),
    config: {
        isDevelopmentMode,
        logError: jest.fn(),
        fetchExperimentAssignment: jest.fn(),
        getAnonId: jest.fn(),
    }
})

const createControllablePromise = <T>() => {
    let resOuter, rejOuter

    const promise = new Promise<T>((resolve, reject) => {
        resOuter = resolve
        rejOuter = reject
    })

    return {
        resolve: (resOuter as unknown) as (T) => void,
        reject: (rejOuter as unknown) as (...x: unknown[]) => void,
        promise,
    }
}

describe('useExperiment', () => {
    it('should correctly load an experiment assignment', async () => {
        const ExPlatClient = createMockExPlatClient();
        const { useExperiment } = createExPlatReactClient(ExPlatClient);

        const controllablePromise1 = createControllablePromise<ExperimentAssignment>();
        (ExPlatClient.loadExperimentAssignment as jest.MockedFunction<typeof ExPlatClient.loadExperimentAssignment>).mockImplementationOnce(() => controllablePromise1.promise)

        const { result, rerender, waitForNextUpdate } = renderHook(() => useExperiment('experiment_a'))

        expect(result.current).toEqual([true, null])
        act(() => controllablePromise1.resolve(validExperimentAssignment))
        expect(result.current).toEqual([true, null])
        await waitForNextUpdate()
        expect(result.current).toEqual([false, validExperimentAssignment])
        rerender()
        expect(result.current).toEqual([false, validExperimentAssignment])
    })
})