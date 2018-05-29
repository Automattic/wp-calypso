/** @format */

/**
 * External dependencies
 */
import page from 'page';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import DocumentHead from 'components/data/document-head';
import HeaderCake from 'components/header-cake';
import FormCountrySelect from 'components/forms/form-country-select';
import FormToggle from 'components/forms/form-toggle';
import getCountries from 'state/selectors/get-countries';
import Main from 'components/main';
import QueryDomainCountries from 'components/data/query-countries/domains';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import WizardProgressBar from 'components/wizard-progress-bar';
import { getSelectedSiteSlug } from 'state/ui/selectors';

class GoogleMyBusinessEnterAddress extends Component {
	static propTypes = {
		countriesList: PropTypes.array.isRequired,
		siteSlug: PropTypes.string,
		translate: PropTypes.func.isRequired,
	};

	state = {
		isServiceAreaBusiness: false
	};

	goBack = () => {
		page.back( `/google-my-business/new/${ this.props.siteSlug }` );
	};

	toggleServiceAreaBusiness = () => {
		this.setState( {
			isServiceAreaBusiness: ! this.state.isServiceAreaBusiness
		} );
	};

	render() {
		const { translate } = this.props;

		return (
			<Main wideLayout>
				<PageViewTracker
					path="/google-my-business/create/enter-address/:site"
					title="Google My Business > Create > Enter Address"
				/>

				<DocumentHead title={ translate( 'Google My Business' ) } />

				<HeaderCake isCompact={ false } alwaysShowActionText={ false } onClick={ this.goBack }>
					{ translate( 'Google My Business' ) }
				</HeaderCake>

				<Card className="gmb-enter-address__form">
					<h1>
						{ translate( 'Where are you located?' ) }
					</h1>

					<QueryDomainCountries />
					<FormCountrySelect countriesList={ this.props.countriesList } />

					<FormToggle
						checked={ this.state.isServiceAreaBusiness }
						onChange={ this.toggleServiceAreaBusiness }
					>
						{ translate( 'I deliver goods and services to my customers. {{link}}Learn more{{/link}}.', {
							components: {
								link: <a href="https://support.google.com/business/answer/3038163" rel="noopener noreferrer" target="_blank" />,
							}
						} ) }
					</FormToggle>
				</Card>

				<WizardProgressBar
					currentStep={ 2 }
					numberOfSteps={ 5 }
				/>
			</Main>
		);
	}
}

export default connect(
	state => ( {
		countriesList: getCountries( state, 'domains' ),
		siteSlug: getSelectedSiteSlug( state ),
	} )
)( localize( GoogleMyBusinessEnterAddress ) );
