/** @format */

/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Card from 'components/card';
import FormattedHeader from 'components/formatted-header';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormTextInput from 'components/forms/form-text-input';
import FormTextarea from 'components/forms/form-textarea';
import Main from 'components/main';

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
							<FormTextInput onChange={ this.setTitle } value={ this.state.title } />

							<FormLabel>{ translate( 'Site Description' ) }</FormLabel>
							<FormTextarea onChange={ this.setDescription } value={ this.state.description } />

							<Button href={ this.props.getForwardUrl() } primary>
								{ translate( 'Next Step' ) }
							</Button>
						</FormFieldset>
					</form>
				</Card>
			</Main>
		);
	}
}

export default localize( JetpackOnboardingSiteTitleStep );
