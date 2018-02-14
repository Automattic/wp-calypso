/** @format */

/**
 * External dependencies
 */
import React from 'react';
import page from 'page';
import { connect } from 'react-redux';
import { get } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Card from 'components/card';
import DocumentHead from 'components/data/document-head';
import FormattedHeader from 'components/formatted-header';
import JetpackOnboardingDisclaimer from '../disclaimer';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import SiteTitle from 'components/site-title';
import { JETPACK_ONBOARDING_STEPS as STEPS } from '../constants';
import { saveJetpackOnboardingSettings } from 'state/jetpack-onboarding/actions';

class JetpackOnboardingSiteTitleStep extends React.PureComponent {
	state = {
		blogname: get( this.props.settings, 'siteTitle' ),
		blogdescription: get( this.props.settings, 'siteDescription' ),
	};

	componentWillReceiveProps( nextProps ) {
		if ( this.props.isRequestingSettings && ! nextProps.isRequestingSettings ) {
			this.setState( {
				blogname: nextProps.settings.siteTitle,
				blogdescription: nextProps.settings.siteDescription,
			} );
		}
	}

	handleChange = ( { blogname, blogdescription } ) => {
		this.setState( { blogname, blogdescription } );
	};

	handleSubmit = event => {
		event.preventDefault();
		if ( this.props.isRequestingSettings ) {
			return;
		}

		this.props.saveJetpackOnboardingSettings( this.props.siteId, {
			siteTitle: this.state.blogname,
			siteDescription: this.state.blogdescription,
		} );
		page( this.props.getForwardUrl() );
	};

	render() {
		const { basePath, isRequestingSettings, translate } = this.props;
		const headerText = translate( "Let's get started." );
		const subHeaderText = translate(
			'First up, what would you like to name your site and have as its public description?'
		);

		return (
			<div className="steps__main">
				<DocumentHead title={ translate( 'Site Title ‹ Jetpack Start' ) } />
				<PageViewTracker
					path={ [ basePath, STEPS.SITE_TITLE, ':site' ].join( '/' ) }
					title="Site Title ‹ Jetpack Start"
				/>

				<FormattedHeader headerText={ headerText } subHeaderText={ subHeaderText } />

				<Card className="steps__form">
					<form onSubmit={ this.handleSubmit }>
						<SiteTitle
							autoFocusBlogname
							blogname={ this.state.blogname || '' }
							blogdescription={ this.state.blogdescription || '' }
							disabled={ isRequestingSettings }
							isBlognameRequired
							onChange={ this.handleChange }
						/>

						<Button
							disabled={ isRequestingSettings || ! this.state.blogname }
							primary
							type="submit"
						>
							{ translate( 'Next Step' ) }
						</Button>
					</form>
				</Card>

				<JetpackOnboardingDisclaimer />
			</div>
		);
	}
}

export default connect( null, { saveJetpackOnboardingSettings } )(
	localize( JetpackOnboardingSiteTitleStep )
);
