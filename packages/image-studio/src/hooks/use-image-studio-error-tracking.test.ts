import { renderHook } from '@testing-library/react';
import { vi } from 'vitest';
import { ImageStudioMode } from '../types';
import { trackImageStudioError } from '../utils/tracking';
import { useImageStudioErrorTracking } from './use-image-studio-error-tracking';

// The package root loads the whole chat; the real tracking module only needs its credits helpers.
vi.mock( '@automattic/agents-manager', () =>
	vi.importActual( '@automattic/agents-manager/src/utils/credits' )
);

vi.mock( '../utils/tracking', async () => ( {
	...( await vi.importActual< typeof import( '../utils/tracking' ) >( '../utils/tracking' ) ),
	trackImageStudioError: vi.fn(),
} ) );

describe( 'useImageStudioErrorTracking', () => {
	beforeEach( () => {
		vi.clearAllMocks();
	} );

	it( 'tracks a quota error from the agent error state', () => {
		renderHook( () =>
			useImageStudioErrorTracking(
				'Streaming error: You have reached your free usage limit. Please upgrade to a paid plan to continue. https://jetpack.com/redirect/?source=jetpack-ai-yearly-tier-upgrade-nudge',
				ImageStudioMode.Generate
			)
		);

		expect( trackImageStudioError ).toHaveBeenCalledWith( {
			mode: ImageStudioMode.Generate,
			errorType: 'quota_exceeded',
			attachmentId: undefined,
		} );
	} );

	it( 'does not track the same rendered error more than once', () => {
		const { rerender } = renderHook(
			( { error } ) => useImageStudioErrorTracking( error, ImageStudioMode.Generate ),
			{
				initialProps: { error: 'Provider failed' },
			}
		);

		rerender( { error: 'Provider failed' } );

		expect( trackImageStudioError ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'tracks edit errors with the attachment ID', () => {
		renderHook( () => useImageStudioErrorTracking( 'Provider failed', ImageStudioMode.Edit, 42 ) );

		expect( trackImageStudioError ).toHaveBeenCalledWith( {
			mode: ImageStudioMode.Edit,
			errorType: 'edit_failed',
			attachmentId: 42,
		} );
	} );

	it( 'tracks the same error again after a new request clears it', () => {
		const { rerender } = renderHook(
			( { error } ) => useImageStudioErrorTracking( error, ImageStudioMode.Generate ),
			{
				initialProps: { error: 'Provider failed' as string | null },
			}
		);

		rerender( { error: null } );
		rerender( { error: 'Provider failed' } );

		expect( trackImageStudioError ).toHaveBeenCalledTimes( 2 );
	} );
} );
