/**
 * External dependencies
 */
import React from 'react';

/**
 * WordPress dependencies
 */
import { FormFileUpload } from '@wordpress/components';

const Example = () => (
	<FormFileUpload
		isPrimary
		multiple
		onChange={ ( event ) => alert( `${ event?.target?.files?.length ?? 0 } files uploaded!` ) }
	>
		Click here to upload some files.
	</FormFileUpload>
);

export default Example;
