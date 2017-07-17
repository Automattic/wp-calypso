/**
 * External dependencies
 */
import React from 'react';
import { reduxForm } from 'redux-form';
import { localize } from 'i18n-calypso';
import { flowRight } from 'lodash';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import FormFieldset from 'components/forms/form-fieldset';
import FormButton from 'components/forms/form-button';
import FormButtonsBar from 'components/forms/form-buttons-bar';
import FormLabel from 'components/forms/form-label';
import ReduxFormTextarea from 'components/redux-forms/redux-form-textarea';
import ReduxFormTextInput from 'components/redux-forms/redux-form-text-input';
import SectionHeader from 'components/section-header';

const ZoneCreator = ( { translate } ) => {
	return (
		<div>
			<form>
				<SectionHeader label={ translate( 'New Zone' ) } />
				<Card>
					<p>
						{ translate(
							'To create a zone, enter a name (and any other info) and click "Add Zone". ' +
							'You can then choose content items to add to the zone.'
						) }
					</p>

					<FormFieldset>
						<FormLabel htmlFor="zoneName">{ translate( 'Name' ) }</FormLabel>
						<ReduxFormTextInput name="zoneName" />
					</FormFieldset>

					<FormFieldset>
						<FormLabel htmlFor="zoneDescription">{ translate( 'Description' ) }</FormLabel>
						<ReduxFormTextarea name="zoneDescription" />
					</FormFieldset>

					<FormButtonsBar>
						<FormButton>{ translate( 'Add Zone' ) }</FormButton>
					</FormButtonsBar>
				</Card>
			</form>
		</div>
	);
};

const createReduxForm = reduxForm( {
	enableReinitialize: true,
	form: 'newZone',
	getFormState: state => state.extensions.zoninator.form,
} );

export default flowRight(
	localize,
	createReduxForm,
)( ZoneCreator );
