/**
 * Mock for @wordpress/media-utils package
 */

import { vi } from 'vitest';
const transformAttachment = vi.fn( ( attachment ) => ( {
	...attachment,
	transformed: true,
} ) );

export { transformAttachment };
