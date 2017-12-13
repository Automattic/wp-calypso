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
import { updateConciergeInfo } from 'state/concierge/info/actions';
import { getConciergeInfo } from 'state/selectors';

class InfoStep extends Component {
	constructor( props ) {
		super( props );

		this.state = {
			timezone: moment.tz.guess(),
			message: '',
		};

		// use them settings from redux if we have
		if ( props.info ) {
			this.state.timezone = props.info.timezone;
			this.state.message = props.info.message;
		}
	}

	static propTypes = {
		info: PropTypes.object,
		onComplete: PropTypes.func.isRequired,
		site: PropTypes.object.isRequired,
	};

	setFieldValue = attribute => {
		let name, value;
		if ( attribute.target ) {
			// handle textarea or other inputs
			name = attribute.target.name;
			value = attribute.target.value;
		} else {
			// handle timezone selector
			name = 'timezone';
			value = attribute;
		}
		this.setState( { [ name ]: value } );
	};

	canSubmitForm = () => {
		const { message } = this.state;
		if ( ! message ) {
			return false;
		}
		return !! message.trim();
	};

	submitForm = () => {
		this.props.updateConciergeInfo( this.props.site.ID, this.state );
		this.props.onComplete();
	};

	render() {
		const { translate } = this.props;

		return (
			<div>
				<PrimaryHeader />
				<CompactCard className="concierge__site-block">
					<Site siteId={ this.props.site.ID } />
				</CompactCard>

				<CompactCard>
					<FormFieldset>
						<FormLabel>{ translate( "What's your timezone?" ) }</FormLabel>
						<Timezone
							name="timezone"
							selectedZone={ this.state.timezone }
							onSelect={ this.setFieldValue }
						/>
						<FormSettingExplanation>
							{ translate( 'Choose a city in your timezone' ) }
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
							value={ this.state.message }
						/>
					</FormFieldset>

					<FormButton
						disabled={ ! this.canSubmitForm() }
						isPrimary={ true }
						type="button"
						onClick={ this.submitForm }
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
		info: getConciergeInfo( state, props.site.ID ),
	} ),
	{
		updateConciergeInfo,
	}
)( localize( InfoStep ) );
