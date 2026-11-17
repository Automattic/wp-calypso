import '@testing-library/jest-dom/vitest';

vi.mock( '@automattic/calypso-config', () => ( {
	isEnabled: () => false,
	__esModule: true,
	default: function config( key: string ) {
		return key;
	},
} ) );

// React Testing Library's `waitFor` only advances fake timers when it finds a global `jest`.
( globalThis as unknown as Record< string, unknown > ).jest = {
	advanceTimersByTime: ( ms: number ) => vi.advanceTimersByTime( ms ),
};
