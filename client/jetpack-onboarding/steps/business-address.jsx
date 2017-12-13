/** @format */

/**
 * External dependencies
 */
import React, { Fragment } from 'react';
import { localize } from 'i18n-calypso';
import { map } from 'lodash';
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

class JetpackOnboardingBusinessAddressStep extends React.PureComponent {
	state = {
		city: '',
		name: '',
		stateName: '',
		street: '',
		zip: '',
	};

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
			stateName: translate( 'State' ),
			zip: translate( 'ZIP Code' ),
		};
	}

	render() {
		const { translate } = this.props;
		const headerText = translate( 'Add a business address.' );
		const subHeaderText = translate(
			'Enter your business address to have a map added to your website.'
		);

		return (
			<Fragment>
				<DocumentHead title={ translate( 'Business Address ‹ Jetpack Onboarding' ) } />
				<FormattedHeader headerText={ headerText } subHeaderText={ subHeaderText } />

				<Card className="steps__form">
					<form>
						{ map( this.fields, ( fieldLabel, fieldName ) => (
							<FormFieldset key={ fieldName }>
								<FormLabel htmlFor={ fieldName }>{ fieldLabel }</FormLabel>
								<FormTextInput
									id={ fieldName }
									onChange={ this.getChangeHandler( fieldName ) }
									value={ this.state[ fieldName ] }
									autoFocus={ fieldName === 'name' }
								/>
							</FormFieldset>
						) ) }
						<Button href={ this.props.getForwardUrl() } primary>
							{ translate( 'Next Step' ) }
						</Button>
					</form>
				</Card>
			</Fragment>
		);
	}
}

export default localize( JetpackOnboardingBusinessAddressStep );
