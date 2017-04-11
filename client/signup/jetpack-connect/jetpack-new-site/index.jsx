/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import page from 'page';

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

const JetpackNewSite = React.createClass( {
	displayName: 'JetpackNewSite',

	componentDidMount() {
		this.props.recordTracksEvent( 'calypso_jetpack_new_site_view' );
	},

	getNewWpcomSiteUrl() {
		return config( 'signup_url' ) + '?ref=calypso-selector';
	},

	onURLEnter( url ) {
		this.props.recordTracksEvent( 'calypso_jetpack_new_site_connect_click' );
		page( '/jetpack/connect?url=' + url );
	},

	handleOnClickTos() {
		this.props.recordTracksEvent( 'calypso_jpc_tos_link_click' );
	},

	handleBack( event ) {
		event.preventDefault();

		// @todo
		// - Record action that user went back
		// - Go back in history
	},

	render() {
		return (
			<div>
				<ReaderBack onBackClick={ this.handleBack } />
				<div className="jetpack-new-site">
					<div className="jetpack-new-site__header">
						<h2 className="jetpack-new-site__header-title">{ this.translate( 'Add a New Site' ) }</h2>
						<div className="jetpack-new-site__header-text">{ this.translate(
							'Create a new site on WordPress.com or add your existing self-hosted WordPress site with Jetpack.'
						) } </div>
					</div>
					<div className="jetpack-new-site__content">
						<Card className="jetpack-new-site__wpcom-site">
							<WordPressLogo />
							<h3 className="jetpack-new-site__card-title">
								{ this.translate( 'Create a new shiny WordPress.com site' ) }
							</h3>
							<div className="jetpack-new-site__card-description">
							<p>
								{ this.translate( 'Start telling your story in just 2 minutes. Pick a visual theme and a domain — we’ll take care of the entire setup. If you need help we’ve got you covered with 24/7 support.' ) }
							</p>
							</div>
							<div className="jetpack-new-site__button-holder">
								<Button className="button is-primary" href={ this.getNewWpcomSiteUrl() }>{ this.translate( 'Start Now' ) }</Button>
							</div>
						</Card>
						<Card className="jetpack-new-site__jetpack-site">
							<JetpackLogo />
							<h3 className="jetpack-new-site__card-title">
								{ this.translate( 'Add an existing WordPress site with Jetpack' ) }
							</h3>
							<div className="jetpack-new-site__card-description">
								{ this.translate( 'We’ll be using the Jetpack plugin to connect your site to WordPress.com.' ) }
							</div>
							<SiteURLInput ref="siteUrlInputRef"
								onTosClick={ this.handleOnClickTos }
								onClick={ this.onURLEnter } />
						</Card>
						<Card className="jetpack-new-site__mobile">
							<div className="jetpack-new-site__mobile-wpcom-site">
								<p>{ this.translate( 'Create a new shiny WordPress.com site:' ) }</p>
								<Button className="button is-primary" href={ this.getNewWpcomSiteUrl() }>{ this.translate( 'Start Now' ) }</Button>
							</div>
							<div className="jetpack-new-site__divider">
								<span>{ this.translate( 'or' ) }</span>
							</div>
							<div className="jetpack-new-site__mobile-jetpack-site">
								<p>{ this.translate( 'Add an existing WordPress site with Jetpack:' ) }</p>
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
} );

export default connect(
	null,
	dispatch => bindActionCreators( {
		recordTracksEvent
	}, dispatch )
)( JetpackNewSite );
