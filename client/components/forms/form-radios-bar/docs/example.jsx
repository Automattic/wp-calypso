/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import FormRadiosBar from 'components/forms/form-radios-bar';
import { radios, radiosWithThumbnails } from 'components/forms/form-radios-bar/docs/fixtures';

const FormRadiosBarExample = ( { isThumbnail, checked, onChange } ) => {
	return (
		<FormRadiosBar
			isThumbnail={ isThumbnail }
			checked={ checked }
			onChange={ onChange }
			items={ isThumbnail ? radiosWithThumbnails : radios }
		/>
	);
};

FormRadiosBarExample.displayName = 'FormRadiosBar';

export default FormRadiosBarExample;
