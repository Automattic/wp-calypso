/* @format */

/**
 * Internal dependencies
 */
import {
	IMPORTS_UPLOAD_FILE_CLEAR,
	IMPORTS_UPLOAD_EVALUATE_FILE,
	IMPORTS_UPLOAD_RECOMMEND_UX,
} from 'state/action-types';

export const clearImportFile = () => ( {
	type: IMPORTS_UPLOAD_FILE_CLEAR,
} );

export const evaluateImportFile = file => {
	console.log( { file } );
	return {
		type: IMPORTS_UPLOAD_EVALUATE_FILE,
		file,
	};
};

export const recommendImportUX = ux => ( {
	type: IMPORTS_UPLOAD_RECOMMEND_UX,
	ux,
} );
