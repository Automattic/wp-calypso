/** @format */

/**
 * External dependencies
 */
import React from 'react';
import page from 'page';
import { get } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Card from 'components/card';
import FormattedHeader from 'components/formatted-header';
import JetpackOnboardingDisclaimer from '../disclaimer';
import SiteTitle from 'components/site-title';

class JetpackOnboardingSiteTitleStep extends React.PureComponent {
	state = {
		blogname: this.getFieldValue( 'siteTitle' ),
		blogdescription: this.getFieldValue( 'siteDescription' ),
	};

	componentWillReceiveProps( nextProps ) {
		if ( this.props.isRequestingSettings && ! nextProps.isRequestingSettings ) {
			this.setState( {
				blogname: nextProps.settings.siteTitle,
				blogdescription: nextProps.settings.siteDescription,
			} );
		}
	}

	getFieldValue( fieldName ) {
		return get( this.props.settings, fieldName );
	}

	handleChange = ( { blogname, blogdescription } ) => {
		this.setState( { blogname, blogdescription } );
	};

	handleSubmit = event => {
		event.preventDefault();
		if ( this.props.isRequestingSettings ) {
			return;
		}

		this.props.recordJpoEvent( 'calypso_jpo_site_title_submitted', {
			title_changed: this.state.blogname !== this.getFieldValue( 'siteTitle' ),
			description_changed: this.state.blogdescription !== this.getFieldValue( 'siteDescription' ),
		} );

		this.props.saveJpoSettings( this.props.siteId, {
			siteTitle: this.state.blogname,
			siteDescription: this.state.blogdescription,
		} );

		page( this.props.getForwardUrl() );
	};

	render() {
		const { isRequestingSettings, isRequestingWhetherConnected, translate } = this.props;
		const headerText = translate( 'Welcome to WordPress!' );

		return (
			<div className="steps__main" data-e2e-type="site-title">
				<FormattedHeader headerText={ headerText } />

				<Card className="steps__form">
					<img
						className="steps__illustration"
						src={ '/calypso/images/illustrations/jetpack-start.svg' }
						alt=""
					/>

					<div className="steps__description">
						<p>{ translate( "Let's help you get set up." ) }</p>
						<p>
							{ translate(
								'First up, what would you like to name your site and have as its public description?'
							) }
						</p>
					</div>

					<form onSubmit={ this.handleSubmit }>
						<SiteTitle
							autoFocusBlogname
							blogname={ this.state.blogname || '' }
							blogdescription={ this.state.blogdescription || '' }
							disabled={ isRequestingSettings || isRequestingWhetherConnected }
							isBlognameRequired
							onChange={ this.handleChange }
						/>

						<JetpackOnboardingDisclaimer recordJpoEvent={ this.props.recordJpoEvent } />

						<Button
							disabled={ isRequestingSettings || ! this.state.blogname }
							primary
							type="submit"
						>
							{ translate( 'Continue' ) }
						</Button>
					</form>
				</Card>
			</div>
		);
	}
}

export default localize( JetpackOnboardingSiteTitleStep );
