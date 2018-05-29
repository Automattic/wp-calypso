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
import Main from 'components/main';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import WizardProgressBar from 'components/wizard-progress-bar';
import { getSelectedSiteSlug } from 'state/ui/selectors';

class GoogleMyBusinessEnterAddress extends Component {
	static propTypes = {
		siteSlug: PropTypes.string,
		translate: PropTypes.func.isRequired,
	};

	goBack = () => {
		page.back( `/google-my-business/new/${ this.props.siteSlug }` );
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
		siteSlug: getSelectedSiteSlug( state ),
	} )
)( localize( GoogleMyBusinessEnterAddress ) );
