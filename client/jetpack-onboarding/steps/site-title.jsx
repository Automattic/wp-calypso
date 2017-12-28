/** @format */

/**
 * External dependencies
 */
import React, { Fragment } from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Button from 'client/components/button';
import Card from 'client/components/card';
import DocumentHead from 'client/components/data/document-head';
import FormattedHeader from 'client/components/formatted-header';
import FormFieldset from 'client/components/forms/form-fieldset';
import FormLabel from 'client/components/forms/form-label';
import FormTextarea from 'client/components/forms/form-textarea';
import FormTextInput from 'client/components/forms/form-text-input';
import { saveJetpackOnboardingSettings } from 'client/state/jetpack-onboarding/actions';

class JetpackOnboardingSiteTitleStep extends React.PureComponent {
	state = {
		description: '',
		title: '',
	};

	setDescription = event => {
		this.setState( { description: event.target.value } );
	};

	setTitle = event => {
		this.setState( { title: event.target.value } );
	};

	submit = () => {
		this.props.saveJetpackOnboardingSettings( this.props.siteId, {
			siteTitle: this.state.title,
			siteDescription: this.state.description,
		} );
	};

	render() {
		const { translate } = this.props;
		const headerText = translate( "Let's get started." );
		const subHeaderText = translate(
			'First up, what would you like to name your site and have as its public description?'
		);

		return (
			<Fragment>
				<DocumentHead title={ translate( 'Site Title ‹ Jetpack Onboarding' ) } />
				<FormattedHeader headerText={ headerText } subHeaderText={ subHeaderText } />

				<Card className="steps__form">
					<form>
						<FormFieldset>
							<FormLabel htmlFor="title">{ translate( 'Site Title' ) }</FormLabel>
							<FormTextInput
								autoFocus
								id="title"
								onChange={ this.setTitle }
								value={ this.state.title }
							/>
						</FormFieldset>

						<FormFieldset>
							<FormLabel htmlFor="description">{ translate( 'Site Description' ) }</FormLabel>
							<FormTextarea
								id="description"
								onChange={ this.setDescription }
								value={ this.state.description }
							/>
						</FormFieldset>

						<Button href={ this.props.getForwardUrl() } onClick={ this.submit } primary>
							{ translate( 'Next Step' ) }
						</Button>
					</form>
				</Card>
			</Fragment>
		);
	}
}

export default connect( null, { saveJetpackOnboardingSettings } )(
	localize( JetpackOnboardingSiteTitleStep )
);
