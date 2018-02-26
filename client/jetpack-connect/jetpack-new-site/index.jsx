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
import JetpackLogo from 'components/jetpack-logo';
import BackButton from 'components/back-button';
import SiteUrlInput from '../site-url-input';
import WordPressLogo from 'components/wordpress-logo';
import { recordTracksEvent } from 'state/analytics/actions';

class JetpackNewSite extends Component {
	constructor() {
		super();
		this.handleOnClickTos = this.handleOnClickTos.bind( this );
		this.handleBack = this.handleBack.bind( this );
	}

	state = { jetpackUrl: '' };

	componentDidMount() {
		this.props.recordTracksEvent( 'calypso_jetpack_new_site_view' );
	}

	handleJetpackUrlChange = event => this.setState( { jetpackUrl: event.target.value } );

	getNewWpcomSiteUrl() {
		return config( 'signup_url' ) + '?ref=calypso-selector';
	}

	handleJetpackSubmit = () => {
		this.props.recordTracksEvent( 'calypso_jetpack_new_site_connect_click' );
		page( '/jetpack/connect?url=' + this.state.jetpackUrl );
	};

	handleOnClickTos() {
		this.props.recordTracksEvent( 'calypso_jpc_tos_link_click' );
	}

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
					<div className="jetpack-new-site__header">
						<h2 className="jetpack-new-site__header-title">
							{ this.props.translate( 'Add a New Site' ) }
						</h2>
						<div className="jetpack-new-site__header-text">
							{ this.props.translate(
								'Create a new site on WordPress.com or add your existing self-hosted WordPress site with Jetpack.'
							) }{' '}
						</div>
					</div>
					<div className="jetpack-new-site__content">
						<Card className="jetpack-new-site__wpcom-site">
							<WordPressLogo />
							<h3 className="jetpack-new-site__card-title">
								{ this.props.translate( 'Create a shiny new WordPress.com site' ) }
							</h3>
							<div className="jetpack-new-site__card-description">
								<p>
									{ this.props.translate(
										"Tell us what type of site you need and we'll get you setup. " +
											'If you need help we’ve got you covered with 24/7 support.'
									) }
								</p>
							</div>
							<div className="jetpack-new-site__button-holder">
								<Button
									className="jetpack-new-site__button button is-primary"
									href={ this.getNewWpcomSiteUrl() }
								>
									{ this.props.translate( 'Start Now' ) }
								</Button>
							</div>
						</Card>
						<Card className="jetpack-new-site__jetpack-site">
							<JetpackLogo size={ 72 } />
							<h3 className="jetpack-new-site__card-title">
								{ this.props.translate( 'Add an existing WordPress site with Jetpack' ) }
							</h3>
							<div className="jetpack-new-site__card-description">
								{ this.props.translate(
									'We’ll be using the Jetpack plugin to connect your site to WordPress.com.'
								) }
							</div>
							<SiteUrlInput
								onChange={ this.handleJetpackUrlChange }
								onSubmit={ this.handleJetpackSubmit }
								handleOnClickTos={ this.handleOnClickTos }
								url={ this.state.jetpackUrl }
							/>
						</Card>
						<Card className="jetpack-new-site__mobile">
							<div className="jetpack-new-site__mobile-wpcom-site">
								<p>{ this.props.translate( 'Create a new shiny WordPress.com site:' ) }</p>
								<Button primary href={ this.getNewWpcomSiteUrl() }>
									{ this.props.translate( 'Start Now' ) }
								</Button>
							</div>
							<div className="jetpack-new-site__divider">
								<span>{ this.props.translate( 'or' ) }</span>
							</div>
							<div className="jetpack-new-site__mobile-jetpack-site">
								<p>{ this.props.translate( 'Add an existing WordPress site with Jetpack:' ) }</p>
								<SiteUrlInput
									onChange={ this.handleJetpackUrlChange }
									onSubmit={ this.handleJetpackSubmit }
									handleOnClickTos={ this.handleOnClickTos }
									url={ this.state.jetpackUrl }
								/>
							</div>
						</Card>
					</div>
				</div>
			</div>
		);
	}
}

export default connect( null, { recordTracksEvent } )( localize( JetpackNewSite ) );
