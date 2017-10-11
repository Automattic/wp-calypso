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

const MissingFeature = ( { translate } ) => (
	<div>
		<Card className="disconnect-site__question">
			<p>{ translate( 'Which feature where you looking for?' ) }</p>
			<div>
				<FormTextInput />
			</div>
		</Card>
	</div>
);

export default localize( MissingFeature );
