/** @format */

/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import page from 'page';

/**
 * Internal dependencies
 */
import { recordTracksEvent } from 'state/analytics/actions';
import Card from 'components/card';
import HeaderCake from 'components/header-cake';
import FormFieldset from 'components/forms/form-fieldset';
import FormLegend from 'components/forms/form-legend';
import FormLabel from 'components/forms/form-label';
import FormTelInput from 'components/forms/form-tel-input';
import FormTextInput from 'components/forms/form-text-input';
import Main from 'components/main';
import StepNavigation from '../step-navigation';

class GoogleMyBusinessConnections extends Component {
	static propTypes = {
		recordTracksEvent: PropTypes.func.isRequired,
		translate: PropTypes.func.isRequired,
	};

	goBack = () => {
		page.back( `/google-my-business/${ this.props.siteId }` );
	};

	render() {
		const { translate, siteId } = this.props;
		const nextHref = '/google-my-business/verify/' + siteId;
		const backHref = '/google-my-business/category/' + siteId;

		return (
			<Main className="google-my-business google-my-business-connections">
				<HeaderCake isCompact={ false } alwaysShowActionText={ false } onClick={ this.goBack }>
					{ translate( 'Google My Business' ) }
				</HeaderCake>

				<Card>
					<FormFieldset>
						<FormLegend>Make connections (optional)</FormLegend>

						<p>
							Providing current info will help customers get in touch and learn more about your
							business
						</p>

						<FormLabel>{ translate( 'Phone number' ) }</FormLabel>
						<FormTelInput />

						<FormLabel>{ translate( 'Website' ) }</FormLabel>
						<FormTextInput />
					</FormFieldset>
				</Card>

				<StepNavigation value={ 70 } total={ 100 } backHref={ backHref } nextHref={ nextHref } />
			</Main>
		);
	}
}

export default connect( undefined, { recordTracksEvent } )(
	localize( GoogleMyBusinessConnections )
);
