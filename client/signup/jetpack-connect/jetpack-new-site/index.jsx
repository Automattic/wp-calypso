/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import page from 'page';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Card from 'components/card';
import config from 'config';
import { recordTracksEvent } from 'state/analytics/actions';
import SiteURLInput from '../site-url-input';
import ReaderBack from '../../../blocks/reader-full-post/back';

import WordPressLogo from 'components/wordpress-logo';
import JetpackLogo from 'components/jetpack-logo';

class JetpackNewSite extends Component {
	constructor() {
		super();
		this.onURLEnter = this.onURLEnter.bind( this );
		this.handleOnClickTos = this.handleOnClickTos.bind( this );
		this.handleBack = this.handleBack.bind( this );
	}

	componentDidMount() {
		this.props.recordTracksEvent( 'calypso_jetpack_new_site_view' );
	}

	getNewWpcomSiteUrl() {
		return config( 'signup_url' ) + '?ref=calypso-selector';
	}

	onURLEnter( url ) {
		this.props.recordTracksEvent( 'calypso_jetpack_new_site_connect_click' );
		page( '/jetpack/connect?url=' + url );
	}

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
				<ReaderBack onBackClick={ this.handleBack } />
				<div className="jetpack-new-site__main jetpack-new-site">
					<div className="jetpack-new-site__header">
						<h2 className="jetpack-new-site__header-title">{ this.props.translate( 'Add a New Site' ) }</h2>
						<div className="jetpack-new-site__header-text">{ this.props.translate(
							'Create a new site on WordPress.com or add your existing self-hosted WordPress site with Jetpack.'
						) } </div>
					</div>
					<div className="jetpack-new-site__content">
						<Card className="jetpack-new-site__wpcom-site">
							<WordPressLogo />
							<h3 className="jetpack-new-site__card-title">
								{ this.props.translate( 'Create a new shiny WordPress.com site' ) }
							</h3>
							<div className="jetpack-new-site__card-description">
							<p>
								{ this.props.translate(
									'Start telling your story in just 2 minutes. Pick a visual theme and a domain — ' +
									'we’ll take care of the entire setup. If you need help we’ve got you covered with 24/7 support.' ) }
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
							<JetpackLogo />
							<h3 className="jetpack-new-site__card-title">
								{ this.props.translate( 'Add an existing WordPress site with Jetpack' ) }
							</h3>
							<div className="jetpack-new-site__card-description">
								{ this.props.translate( 'We’ll be using the Jetpack plugin to connect your site to WordPress.com.' ) }
							</div>
							<SiteURLInput ref="siteUrlInputRef"
								onTosClick={ this.handleOnClickTos }
								onClick={ this.onURLEnter } />
						</Card>
						<Card className="jetpack-new-site__mobile">
							<div className="jetpack-new-site__mobile-wpcom-site">
								<p>{ this.props.translate( 'Create a new shiny WordPress.com site:' ) }</p>
								<Button primary	href={ this.getNewWpcomSiteUrl() }>
								{ this.props.translate( 'Start Now' ) }
								</Button>
							</div>
							<div className="jetpack-new-site__divider">
								<span>{ this.props.translate( 'or' ) }</span>
							</div>
							<div className="jetpack-new-site__mobile-jetpack-site">
								<p>{ this.props.translate( 'Add an existing WordPress site with Jetpack:' ) }</p>
								<SiteURLInput ref="siteUrlInputRef"
									onTosClick={ this.handleOnClickTos }
									onClick={ this.onURLEnter } />
							</div>
						</Card>
					</div>
				</div>
			</div>
		);
	}
}

export default connect(
	null,
	dispatch => bindActionCreators( {
		recordTracksEvent
	}, dispatch )
)( localize( JetpackNewSite ) );
