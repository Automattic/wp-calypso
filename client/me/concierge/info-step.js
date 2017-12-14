/** @format */

/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import moment from 'moment-timezone';

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
import PrimaryHeader from './primary-header';
import Site from 'blocks/site';
import { localize } from 'i18n-calypso';
import { updateConciergeSignupForm } from 'state/concierge/signupForm/actions';
import { getConciergeSignupForm, getSiteTimezoneValue } from 'state/selectors';

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
		let message;
		let timezone;
		const { signupForm, timezoneValue, translate } = this.props;

		if ( ! signupForm ) {
			message = '';

			if ( timezoneValue && timezoneValue.length ) {
				// use site timezone
				timezone = timezoneValue;
			} else {
				// guess customer timezone
				timezone = moment.tz.guess();
			}
		} else {
			// use saved values
			message = signupForm.message || '';
			timezone = signupForm.timezone || moment.tz.guess();
		}

		return (
			<div>
				<PrimaryHeader />
				<CompactCard className="concierge__site-block">
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
	( state, props ) => ( {
		signupForm: getConciergeSignupForm( state ),
		timezoneValue: getSiteTimezoneValue( state, props.site.ID ),
	} ),
	{
		updateConciergeSignupForm,
	}
)( localize( InfoStep ) );
