/**
 * @group gutenberg
 */

import { createPrivacyTests } from '../specs-playwright/shared-specs/privacy-testing';

createPrivacyTests( {
	visibility: 'Private',
} );
