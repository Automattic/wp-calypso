/**
 * External dependencies
 */

import { values as objectValues } from 'lodash';

export const AspectRatios = {
	FREE: 'FREE',
	ORIGINAL: 'ORIGINAL',
	ASPECT_1X1: 'ASPECT_1X1',
	ASPECT_16X9: 'ASPECT_16X9',
	ASPECT_4X3: 'ASPECT_4X3',
	ASPECT_3X2: 'ASPECT_3X2',
};

export const MinimumImageDimensions = {
	WIDTH: 50,
	HEIGHT: 50,
};

export const AspectRatiosValues = objectValues( AspectRatios );
