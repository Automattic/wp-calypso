/** @format */

/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import noop from 'lodash/noop';
import page from 'page';

/**
 * Internal dependencies
 */
import { recordTracksEvent } from 'state/analytics/actions';
import Card from 'components/card';
import HeaderCake from 'components/header-cake';
import Button from 'components/button';
import FormInputCheckbox from 'components/forms/form-checkbox';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormLegend from 'components/forms/form-legend';
import FormSelect from 'components/forms/form-select';
import FormTelInput from 'components/forms/form-tel-input';
import FormTextInput from 'components/forms/form-text-input';

class GoogleMyBusinessAddress extends Component {
	static propTypes = {
		recordTracksEvent: PropTypes.func.isRequired,
		translate: PropTypes.func.isRequired,
	};

	goBack = () => {
		page.back( `/google-my-business/${ this.props.siteId }` );
	};

	render() {
		const { translate, siteId } = this.props;
		const href = '/google-my-business/address/' + siteId;

		return (
			<div className="google-my-business-address">
				<HeaderCake isCompact={ false } alwaysShowActionText={ false } onClick={ this.goBack }>
					{ translate( 'Google My Business' ) }
				</HeaderCake>

				<Card>
					<FormFieldset>
						<FormLegend>Where are you located?</FormLegend>

						<FormLabel>{ translate( 'Country' ) }</FormLabel>
						<FormTextInput />

						<FormLabel>{ translate( 'Street Address' ) }</FormLabel>
						<FormTextInput />

						<FormLabel>{ translate( 'City' ) }</FormLabel>
						<FormTextInput />

						<FormLabel>{ translate( 'State' ) }</FormLabel>
						<FormSelect name="state" onChange={ noop }>
							<option>List of states</option>
						</FormSelect>

						<FormLabel>{ translate( 'Postal code' ) }</FormLabel>
						<FormTextInput />

						<p>
							<FormInputCheckbox />
							{ translate( 'I deliver goods and services to my customers. Learn more.' ) }
						</p>
					</FormFieldset>
					<Button primary href={ href }>
						Next
					</Button>
				</Card>
			</div>
		);
	}
}

export default connect( undefined, { recordTracksEvent } )( localize( GoogleMyBusinessAddress ) );
