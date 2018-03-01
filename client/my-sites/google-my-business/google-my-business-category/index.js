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
import Search from 'components/search';
import FormFieldset from 'components/forms/form-fieldset';
import FormLegend from 'components/forms/form-legend';
class GoogleMyBusinessCategory extends Component {
	static propTypes = {
		recordTracksEvent: PropTypes.func.isRequired,
		translate: PropTypes.func.isRequired,
	};

	goBack = () => {
		page.back( `/google-my-business/${ this.props.siteId }` );
	};

	render() {
		const { translate, siteId } = this.props;
		const href = '/google-my-business/create/' + siteId;

		return (
			<div className="google-my-business-address">
				<HeaderCake isCompact={ false } alwaysShowActionText={ false } onClick={ this.goBack }>
					{ translate( 'Google My Business' ) }
				</HeaderCake>

				<Card>
					<FormFieldset>
						<FormLegend>What kind of business do you run?</FormLegend>

						<p>
							Correct category selection helps you attract customers searching for businesses like
							yours in your area. Select a category that best matches your business. Learn more
						</p>

						<Search
							onSearch={ this.handleSearch }
							inputLabel={ translate( 'Business Category' ) }
						/>
					</FormFieldset>
					<Button primary href={ href }>
						Next
					</Button>
				</Card>
			</div>
		);
	}
}

export default connect( undefined, { recordTracksEvent } )( localize( GoogleMyBusinessCategory ) );
