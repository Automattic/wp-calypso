/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import page from 'page';
import { connect } from 'react-redux';
import { reduxForm } from 'redux-form';
import { localize } from 'i18n-calypso';
import { flowRight } from 'lodash';

/**
 * Internal dependencies
 */
import CompactCard from 'components/card';
import FormFieldset from 'components/forms/form-fieldset';
import FormButton from 'components/forms/form-button';
import FormLabel from 'components/forms/form-label';
import HeaderCake from 'components/header-cake';
import ReduxFormTextarea from 'components/redux-forms/redux-form-textarea';
import ReduxFormTextInput from 'components/redux-forms/redux-form-text-input';
import SectionHeader from 'components/section-header';
import { getSelectedSiteSlug } from 'state/ui/selectors';

const ZoneCreator = ( { siteSlug, translate } ) => {
	const handleGoBack = () => {
		page( `/extensions/zoninator/${ siteSlug }` );
	};

	return (
		<div>
			<HeaderCake onClick={ handleGoBack }>
				{ translate( 'Add a zone' ) }
			</HeaderCake>

			<form>
				<SectionHeader label={ translate( 'New zone' ) }>
					<FormButton compact>{ translate( 'Save' ) }</FormButton>
				</SectionHeader>
				<CompactCard>
					<FormFieldset>
						<FormLabel htmlFor="zoneName">{ translate( 'Zone name' ) }</FormLabel>
						<ReduxFormTextInput name="zoneName" />
					</FormFieldset>

					<FormFieldset>
						<FormLabel htmlFor="zoneDescription">{ translate( 'Zone description' ) }</FormLabel>
						<ReduxFormTextarea name="zoneDescription" />
					</FormFieldset>
				</CompactCard>
			</form>
		</div>
	);
};

ZoneCreator.propTypes = {
	siteSlug: PropTypes.string,
};

const connectComponent = connect( state => {
	return {
		siteSlug: getSelectedSiteSlug( state ),
	};
} );

const createReduxForm = reduxForm( {
	enableReinitialize: true,
	form: 'newZone',
	getFormState: state => state.extensions.zoninator.form,
} );

export default flowRight(
	connectComponent,
	localize,
	createReduxForm,
)( ZoneCreator );
