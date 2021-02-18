/**
 * External dependencies
 */
import React from 'react';

/**
 * WordPress dependencies
 */
import { FormFileUpload } from '@wordpress/components';

const FormFileUploadExample = () => (
	<FormFileUpload
		isPrimary
		multiple
		onChange={ ( event ) =>
			window.alert( `${ event?.target?.files?.length ?? 0 } files uploaded!` )
		}
	>
		Click here to upload some files.
	</FormFileUpload>
);

export default FormFileUploadExample;
