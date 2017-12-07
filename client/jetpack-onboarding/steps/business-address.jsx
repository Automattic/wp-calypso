/** @format */

/**
 * External dependencies
 */
import React, { Fragment } from 'react';
import { localize } from 'i18n-calypso';

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
		stateLoc: '',
		street: '',
		zip: '',
	};

	setInput = field => event => {
		this.setState( { [ field ]: event.target.value } );
	};

	render() {
		const { translate } = this.props;
		const headerText = translate( 'Add a business address.' );
		const subHeaderText = translate(
			'Enter your business address to have a map added to your website.'
		);

		const fields = [
			[ 'city', 'City' ],
			[ 'name', 'Business Name' ],
			[ 'stateLoc', 'State' ],
			[ 'street', 'Street Address' ],
			[ 'zip', 'ZIP Code' ],
		];
		const formFields = fields.map( ( [ field, fieldText ] ) => {
			return (
				<FormFieldset key={ field }>
					<FormLabel htmlFor={ field }>
						{ translate( ' %(title)s ', {
							textOnly: true,
							args: { title: fieldText },
						} ) }
					</FormLabel>
					<FormTextInput
						id={ field }
						onChange={ this.setInput( field ) }
						value={ this.state.field }
					/>
				</FormFieldset>
			);
		} );
		return (
			<Fragment>
				<DocumentHead title={ translate( 'Business Address ‹ Jetpack Onboarding' ) } />
				<FormattedHeader headerText={ headerText } subHeaderText={ subHeaderText } />

				<Card className="steps__form">
					<form>
						{ formFields }
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
