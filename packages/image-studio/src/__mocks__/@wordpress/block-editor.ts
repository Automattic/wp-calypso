/**
 * Mock for @wordpress/block-editor package
 */

import { vi } from 'vitest';
export const store = {
	name: 'core/block-editor',
};

export const useBlockProps = vi.fn( () => ( {} ) );
