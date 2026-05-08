import { mutationOptions } from '@tanstack/react-query';
import type { ComposerConfig } from './composer-config';

interface TestError {
	kind: string;
	message?: string;
}

interface TestParams {
	connectionId: number;
	text: string;
}

interface TestResult {
	uri: string;
}

/**
 * Minimal `ComposerConfig` fixture for tests that exercise the
 * provider/modal shell without caring about per-protocol behaviour.
 * Mutation never resolves — tests that need an outcome should provide
 * their own config or override `mutationFactory`.
 */
export const testComposerConfig: ComposerConfig< TestError, TestParams, TestResult > = {
	useLimit: () => 300,
	supportedModes: [ 'reply', 'quote', 'standalone' ],
	mutationFactory: () =>
		mutationOptions< TestResult, TestError, TestParams >( {
			mutationFn: () =>
				new Promise< TestResult >( () => {
					/* never resolves — overridden per-test when an outcome is needed */
				} ),
		} ),
	buildParams: ( mode, text ) => ( { connectionId: mode.connectionId, text } ),
	errorMessage: ( error ) => `error: ${ error.kind }`,
	successNotice: () => ( { text: 'Posted.', threadUrl: null } ),
	tracks: {
		opened: ( mode ) => ( {
			event: `test_composer_opened_${ mode.kind }`,
			props: { connection_id: mode.connectionId },
		} ),
		published: ( mode ) => ( {
			event: `test_composer_published_${ mode.kind }`,
			props: { connection_id: mode.connectionId },
		} ),
		errorShown: ( mode, error ) => ( {
			event: `test_composer_error_${ mode.kind }`,
			props: { connection_id: mode.connectionId, error_kind: error.kind },
		} ),
	},
	copy: {
		title: ( mode ) => `Title:${ mode.kind }`,
		placeholder: ( mode ) => `Placeholder:${ mode.kind }`,
	},
};
