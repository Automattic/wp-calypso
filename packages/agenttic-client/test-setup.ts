// Mock streamdown and its CSS imports for testing
import { vi } from 'vitest';

// Mock streamdown completely to avoid CSS import issues
vi.mock( 'streamdown', () => {
	return {
		default: vi.fn( () => null ), // Return a dummy component
	};
} );
