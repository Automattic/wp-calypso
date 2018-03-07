/** @format */
/**
 * External dependencies
 */
import page from 'page';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Card from 'components/card';
import config from 'config';
import FormattedHeader from 'components/formatted-header';
import BackButton from 'components/back-button';
import { recordTracksEvent } from 'state/analytics/actions';

class JetpackNewSite extends Component {
	constructor() {
		super();
		this.handleBack = this.handleBack.bind( this );
	}

	componentDidMount() {
		this.props.recordTracksEvent( 'calypso_jetpack_new_site_view' );
	}

	getNewWpcomSiteUrl() {
		return config( 'signup_url' ) + '?ref=calypso-selector';
	}

	handleGetNewJetpackSiteUrl = () => {
		this.props.recordTracksEvent( 'calypso_jetpack_new_site_connect_click' );
		page( '/jetpack/connect' );
	};

	handleBack( event ) {
		event.preventDefault();
		this.props.recordTracksEvent( 'calypso_jetpack_new_site_back' );
		page.back();
	}

	render() {
		return (
			<div>
				<BackButton onClick={ this.handleBack } />
				<div className="jetpack-new-site__main jetpack-new-site">
					<FormattedHeader
						headerText={ this.props.translate( 'Add a New Site' ) }
						subHeaderText={ this.props.translate(
							'Create a new site or add your existing self-hosted site.'
						) }
					/>
					<div className="jetpack-new-site__content">
						<Card className="jetpack-new-site__card">
							<div className="jetpack-new-site__card-description">
								<p>{ this.props.translate( 'Create a shiny new WordPress.com site.' ) }</p>
							</div>
							<Button
								className="jetpack-new-site__button button is-primary"
								href={ this.getNewWpcomSiteUrl() }
							>
								{ this.props.translate( 'Create a new site' ) }
							</Button>

							<div className="jetpack-new-site__divider">
								<span>{ this.props.translate( 'or' ) }</span>
							</div>

							<div className="jetpack-new-site__card-description">
								<p>
									{ this.props.translate(
										'If you already have a WordPress site hosted somewhere else, we can add it for you now.'
									) }
								</p>
							</div>
							<Button
								className="jetpack-new-site__connect-button button is-primary"
								onClick={ this.handleGetNewJetpackSiteUrl }
							>
								{ this.props.translate( 'Add existing site' ) }
							</Button>
						</Card>
					</div>
				</div>
			</div>
		);
	}
}

export default connect( null, { recordTracksEvent } )( localize( JetpackNewSite ) );
