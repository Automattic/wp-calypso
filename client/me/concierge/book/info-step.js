/** @format */

/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import CompactCard from 'components/card/compact';
import FormButton from 'components/forms/form-button';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormSettingExplanation from 'components/forms/form-setting-explanation';
import FormTextarea from 'components/forms/form-textarea';
import Timezone from 'components/timezone';
import Site from 'blocks/site';
import { localize } from 'i18n-calypso';
import { updateConciergeSignupForm } from 'state/concierge/actions';
import { getConciergeSignupForm } from 'state/selectors';
import PrimaryHeader from '../shared/primary-header';

class InfoStep extends Component {
	static propTypes = {
		signupForm: PropTypes.object,
		onComplete: PropTypes.func.isRequired,
		site: PropTypes.object.isRequired,
	};

	setTimezone = timezone => {
		this.props.updateConciergeSignupForm( { ...this.props.signupForm, timezone } );
	};

	setFieldValue = ( { target } ) => {
		this.props.updateConciergeSignupForm( {
			...this.props.signupForm,
			[ target.name ]: target.value,
		} );
	};

	canSubmitForm = () => {
		const { signupForm } = this.props;
		if ( ! signupForm.message ) {
			return false;
		}
		return !! signupForm.message.trim();
	};

	render() {
		const { signupForm: { message, timezone }, translate } = this.props;

		return (
			<div>
				<PrimaryHeader />
				<CompactCard className="book__site-block">
					<Site siteId={ this.props.site.ID } />
				</CompactCard>

				<CompactCard>
					<FormFieldset>
						<FormLabel>{ translate( "What's your timezone?" ) }</FormLabel>
						<Timezone name="timezone" onSelect={ this.setTimezone } selectedZone={ timezone } />
						<FormSettingExplanation>
							{ translate( 'Choose a city in your timezone.' ) }
						</FormSettingExplanation>
					</FormFieldset>

					<FormFieldset>
						<FormLabel>
							{ translate( 'What are you hoping to accomplish with your site?' ) }
						</FormLabel>
						<FormTextarea
							placeholder={ translate( 'Please be descriptive' ) }
							name="message"
							onChange={ this.setFieldValue }
							value={ message }
						/>
					</FormFieldset>

					<FormButton
						disabled={ ! this.canSubmitForm() }
						isPrimary={ true }
						type="button"
						onClick={ this.props.onComplete }
					>
						{ translate( 'Continue to calendar' ) }
					</FormButton>
				</CompactCard>
			</div>
		);
	}
}

export default connect(
	state => ( {
		signupForm: getConciergeSignupForm( state ),
	} ),
	{
		updateConciergeSignupForm,
	}
)( localize( InfoStep ) );
