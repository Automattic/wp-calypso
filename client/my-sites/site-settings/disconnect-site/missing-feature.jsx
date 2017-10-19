/** @format */
/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import FormTextInput from 'components/forms/form-text-input';
import SectionHeader from 'components/section-header';

const MissingFeature = ( { translate } ) => (
	<div>
		<SectionHeader label={ translate( 'Which feature where you looking for?' ) } />
		<Card>
			<FormTextInput />
		</Card>
	</div>
);

export default localize( MissingFeature );
