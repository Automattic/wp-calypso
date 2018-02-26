/** @format */

/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import page from 'page';
import noop from 'lodash/noop';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Card from 'components/card';
import HeaderCake from 'components/header-cake';
import { recordTracksEvent } from 'state/analytics/actions';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormLegend from 'components/forms/form-legend';
import FormSelect from 'components/forms/form-select';
import FormTelInput from 'components/forms/form-tel-input';
import FormTextInput from 'components/forms/form-text-input';

class Create extends Component {
	static propTypes = {
		recordTracksEvent: PropTypes.func.isRequired,
		translate: PropTypes.func.isRequired,
	};

	goBack = () => {
		page.back( `/google-my-business/${ this.props.siteId }` );
	};

	render() {
		const { translate, siteId } = this.props;
		const href = '/google-my-business/verify/' + siteId;
		return (
			<div className="google-my-business__create">
				<HeaderCake isCompact={ false } alwaysShowActionText={ false } onClick={ this.goBack }>
					{ translate( 'Google My Business' ) }
				</HeaderCake>

				<Card>
					<FormFieldset>
						<FormLegend>Create a listing for your business</FormLegend>

						<FormLabel>{ translate( 'Business name' ) }</FormLabel>
						<FormTextInput />

						<FormLabel>{ translate( 'Phone number' ) }</FormLabel>
						<FormTelInput />

						<FormLabel>{ translate( 'Category' ) }</FormLabel>
						<FormSelect name="category" onChange={ noop }>
							<option>List of categories from Google</option>
						</FormSelect>

						<p>By creating a listing you are agreeing to Google's ToS</p>
					</FormFieldset>
					<Button primary href={ href }>
						Send verification code and create Listing
					</Button>
				</Card>
			</div>
		);
	}
}

export default connect( undefined, { recordTracksEvent } )( localize( Create ) );
