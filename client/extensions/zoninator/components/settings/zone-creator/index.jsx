/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
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
import { settingsPath } from '../../../app/util';

const form = 'extensions.zoninator.newZone';

const ZoneCreator = ( { siteSlug, translate } ) => (
	<div>
		<HeaderCake backHref={ `${ settingsPath }/${ siteSlug }` }>
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

ZoneCreator.propTypes = {
	siteSlug: PropTypes.string,
};

const connectComponent = connect( state => ( {
	siteSlug: getSelectedSiteSlug( state ),
} ) );

const createReduxForm = reduxForm( {
	enableReinitialize: true,
	form,
} );

export default flowRight(
	connectComponent,
	localize,
	createReduxForm,
)( ZoneCreator );
