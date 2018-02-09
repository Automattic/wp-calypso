/** @format */

/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import page from 'page';
import { get, map, omit, some } from 'lodash';
/**
 * Internal dependencies
 */
import Button from 'components/button';
import Card from 'components/card';
import DocumentHead from 'components/data/document-head';
import FormattedHeader from 'components/formatted-header';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormTextInput from 'components/forms/form-text-input';
import FormInputValidation from 'components/forms/form-input-validation';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import { JETPACK_ONBOARDING_STEPS as STEPS } from '../constants';
import { saveJetpackOnboardingSettings } from 'state/jetpack-onboarding/actions';

class JetpackOnboardingBusinessAddressStep extends React.PureComponent {
	static emptyState = {
		city: '',
		name: '',
		state: '',
		street: '',
		zip: '',
	};

	state = get( this.props.settings, 'businessAddress' ) || this.constructor.emptyState;

	componentWillReceiveProps( nextProps ) {
		if ( this.props.isRequestingSettings && ! nextProps.isRequestingSettings ) {
			this.setState( get( nextProps.settings, 'businessAddress' ) || this.constructor.emptyState );
		}
	}

	getChangeHandler = field => event => {
		this.setState( { [ field ]: event.target.value } );
	};

	fields = this.getFields();

	getFields() {
		const { translate } = this.props;

		return {
			name: translate( 'Business Name' ),
			street: translate( 'Street Address' ),
			city: translate( 'City' ),
			state: translate( 'State' ),
			zip: translate( 'ZIP Code' ),
		};
	}

	handleSubmit = event => {
		event.preventDefault();
		if ( this.props.isRequestingSettings ) {
			return;
		}

		const { siteId } = this.props;
		this.props.saveJetpackOnboardingSettings( siteId, { businessAddress: this.state } );
		page( this.props.getForwardUrl() );
	};

	hasEmptyFields = () => {
		return some( omit( this.state, 'state' ), val => val === '' );
	};

	render() {
		const { basePath, isRequestingSettings, translate } = this.props;
		const headerText = translate( 'Add a business address.' );
		const subHeaderText = translate(
			'Enter your business address to have a map added to your website.'
		);
		return (
			<div className="steps__main">
				<DocumentHead title={ translate( 'Business Address ‹ Jetpack Start' ) } />
				<PageViewTracker
					path={ [ basePath, STEPS.BUSINESS_ADDRESS, ':site' ].join( '/' ) }
					title="Business Address ‹ Jetpack Start"
				/>

				<FormattedHeader headerText={ headerText } subHeaderText={ subHeaderText } />

				<Card className="steps__form">
					<form onSubmit={ this.handleSubmit }>
						{ map( this.fields, ( fieldLabel, fieldName ) => (
							<FormFieldset key={ fieldName }>
								<FormLabel htmlFor={ fieldName }>{ fieldLabel }</FormLabel>
								<FormTextInput
									autoFocus={ fieldName === 'name' }
									disabled={ isRequestingSettings }
									id={ fieldName }
									onChange={ this.getChangeHandler( fieldName ) }
									value={ this.state[ fieldName ] || '' }
								/>
								{ fieldName !== 'state' && (
									<FormInputValidation
										isError={ this.state[ fieldName ] === '' }
										text={ translate( 'Required field.' ) }
									/>
								) }
							</FormFieldset>
						) ) }
						<Button
							disabled={ isRequestingSettings || this.hasEmptyFields() }
							primary
							type="submit"
						>
							{ translate( 'Next Step' ) }
						</Button>
					</form>
				</Card>
			</div>
		);
	}
}

export default connect( null, { saveJetpackOnboardingSettings } )(
	localize( JetpackOnboardingBusinessAddressStep )
);
