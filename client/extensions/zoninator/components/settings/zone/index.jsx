/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { flowRight } from 'lodash';
import { FieldArray, FormSection, reduxForm } from 'redux-form';

/**
 * Internal dependencies
 */
import PostsList from './posts-list';
import Button from 'components/button';
import Card from 'components/card';
import FormButton from 'components/forms/form-button';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import HeaderCake from 'components/header-cake';
import ReduxFormTextarea from 'components/redux-forms/redux-form-textarea';
import ReduxFormTextInput from 'components/redux-forms/redux-form-text-input';
import SectionHeader from 'components/section-header';
import { getSelectedSiteSlug } from 'state/ui/selectors';
import { settingsPath } from '../../../app/util';

const form = 'extensions.zoninator.editZone';

class Zone extends Component {

	onFormSubmit = ( event ) => {
		event.preventDefault();
	}

	render() {
		const { siteSlug, translate } = this.props;

		return (
			<div>
				<HeaderCake backHref={ `${ settingsPath }/${ siteSlug }` }>
					{ translate( 'Edit zone' ) }
				</HeaderCake>

				<form onSubmit={ this.onFormSubmit }>
					<FormSection name="details">
						<SectionHeader label={ translate( 'Zone label' ) }>
							<FormButton compact />
						</SectionHeader>
						<Card>
							<FormFieldset>
								<FormLabel htmlFor="zoneName">{ translate( 'Zone name' ) }</FormLabel>
								<ReduxFormTextInput name="zoneName" />
							</FormFieldset>

							<FormFieldset>
								<FormLabel htmlFor="zoneDescription">{ translate( 'Zone description' ) }</FormLabel>
								<ReduxFormTextarea name="zoneDescription" />
							</FormFieldset>
						</Card>
					</FormSection>

					<FormSection name="content">
						<SectionHeader label={ translate( 'Zone content' ) }>
							<FormButton compact />
						</SectionHeader>
						<Card>
							<FieldArray
								rerenderOnEveryChange
								name="posts"
								component={ PostsList } />
						</Card>
					</FormSection>
				</form>

				<SectionHeader label={ translate( 'Delete zone' ) }>
					<Button primary compact scary>{ translate( 'Delete' ) }</Button>
				</SectionHeader>
			</div>
		);
	}
}

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
)( Zone );
