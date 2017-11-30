/** @format */

/**
 * External dependencies
 */
import React from 'react';
import page from 'page';
import { connect } from 'react-redux';
import { flowRight } from 'lodash';
import { formValueSelector, reduxForm } from 'redux-form';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Card from 'components/card';
import FormattedHeader from 'components/formatted-header';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import Main from 'components/main';
import ReduxFormTextarea from 'components/redux-forms/redux-form-textarea';
import ReduxFormTextInput from 'components/redux-forms/redux-form-text-input';
import { setSiteTitle, setSiteDescription } from 'state/jetpack-onboarding/actions';

/**
 * Module variables
 */
const form = 'jetpackOnboarding';
const selector = formValueSelector( form );

class JetpackOnboardingSiteTitleStep extends React.Component {
	handleSubmit = () => {
		const { formSiteDescription, formSiteTitle } = this.props;

		this.props.setSiteTitle( formSiteTitle );
		this.props.setSiteDescription( formSiteDescription );

		page.redirect( this.props.getForwardUrl() );
	};

	render() {
		const { translate } = this.props;
		const headerText = translate( "Let's get started." );
		const subHeaderText = translate(
			'First up, what would you like to name your site and have as its public description?'
		);

		return (
			<Main>
				<FormattedHeader headerText={ headerText } subHeaderText={ subHeaderText } />

				<Card>
					<form>
						<FormFieldset>
							<FormLabel>{ translate( 'Site Title' ) }</FormLabel>
							<ReduxFormTextInput name="siteTitle" />

							<FormLabel>{ translate( 'Site Description' ) }</FormLabel>
							<ReduxFormTextarea name="siteDescription" />

							<Button primary onClick={ this.handleSubmit }>
								{ translate( 'Next Step' ) }
							</Button>
						</FormFieldset>
					</form>
				</Card>
			</Main>
		);
	}
}

const connectComponent = connect(
	state => ( {
		formSiteTitle: selector( state, 'siteTitle' ),
		formSiteDescription: selector( state, 'siteDescription' ),
	} ),
	{
		setSiteDescription,
		setSiteTitle,
	}
);

const createReduxForm = reduxForm( {
	destroyOnUnmount: false,
	form,
} );

export default flowRight( connectComponent, localize, createReduxForm )(
	JetpackOnboardingSiteTitleStep
);
