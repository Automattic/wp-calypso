/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { concat, flowRight } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { Card } from '@automattic/components';
import HelpButton from './help-button';
import LocaleSuggestions from 'components/locale-suggestions';
import LoggedOutFormLinkItem from 'components/logged-out-form/link-item';
import LoggedOutFormLinks from 'components/logged-out-form/links';
import MainHeader from './main-header';
import MainWrapper from './main-wrapper';
import page from 'page';
import SiteUrlInput from './site-url-input';
import { cleanUrl } from './utils';
import { checkUrl, dismissUrl } from 'state/jetpack-connect/actions';
import { FLOW_TYPES } from 'state/jetpack-connect/constants';
import { getConnectingSite, getJetpackSiteByUrl } from 'state/jetpack-connect/selectors';
import { getCurrentUserId } from 'state/current-user/selectors';
import getSites from 'state/selectors/get-sites';
import { isRequestingSites } from 'state/sites/selectors';
import { persistSession, retrieveMobileRedirect } from './persistence-utils';
import { recordTracksEvent } from 'state/analytics/actions';
import { urlToSlug } from 'lib/url';
import searchSites from 'components/search-sites';
import jetpackConnection from './jetpack-connection';

import { JPC_PATH_REMOTE_INSTALL } from './constants';
import { ALREADY_CONNECTED } from './connection-notice-types';

export class SearchPurchase extends Component {
	static propTypes = {
		locale: PropTypes.string,
		path: PropTypes.string,
		type: PropTypes.oneOf( concat( FLOW_TYPES, false ) ),
		url: PropTypes.string,
		processJpSite: PropTypes.func,
	};

	state = this.props.url
		? {
				currentUrl: cleanUrl( this.props.url ),
				shownUrl: this.props.url,
				waitingForSites: false,
				candidateSites: this.props.searchSites( this.props.url ),
		  }
		: {
				currentUrl: '',
				shownUrl: '',
				waitingForSites: false,
				candidateSites: [],
		  };

	getCandidateSites( url ) {
		this.props.searchSites( url );
		let candidateSites = [];

		if ( this.props.sitesFound ) {
			candidateSites = this.props.sitesFound.map( ( site ) => ( {
				label: site.URL,
				category: this.props.translate( 'Choose site' ),
			} ) );
		}

		this.setState( { candidateSites } );
	}

	UNSAFE_componentWillMount() {
		if ( this.props.url ) {
			this.checkUrl( cleanUrl( this.props.url ) );
		}
		if ( ! this.props.isLoggedIn ) {
			this.goToRemoteInstall( JPC_PATH_REMOTE_INSTALL );
		}
	}

	componentDidMount() {
		this.props.recordTracksEvent( 'calypso_jpc_url_view', {
			jpc_from: 'jp_lp',
			cta_id: this.props.ctaId,
			cta_from: this.props.ctaFrom,
		} );
	}

	componentDidUpdate() {
		const { status, processJpSite } = this.props;
		const { currentUrl } = this.state;

		// here we will add status === IS_DOT_COM_SEARCH to the condition once
		// we enable WP.com sites
		if ( status === ALREADY_CONNECTED ) {
			page.redirect( '/checkout/' + urlToSlug( this.state.currentUrl ) + '/' + 'jetpack_search' );
		}

		processJpSite( currentUrl );
	}

	handleUrlChange = ( url ) => {
		this.setState( {
			currentUrl: cleanUrl( url ),
			shownUrl: url,
		} );

		this.getCandidateSites( url );
	};

	checkUrl( url ) {
		return this.props.checkUrl( url, !! this.props.getJetpackSiteByUrl( url ) );
	}

	handleUrlSubmit = () => {
		this.props.recordTracksEvent( 'calypso_jpc_url_submit', {
			jetpack_url: this.state.currentUrl,
		} );
		// Track that connection was started by button-click, so we can auto-approve at auth step.
		persistSession( this.state.currentUrl );

		if ( this.props.isRequestingSites ) {
			this.setState( { waitingForSites: true } );
		} else {
			this.checkUrl( this.state.currentUrl );
		}
	};

	handleOnClickTos = () => this.props.recordTracksEvent( 'calypso_jpc_tos_link_click' );

	renderFooter() {
		const { translate } = this.props;
		return (
			<LoggedOutFormLinks>
				<LoggedOutFormLinkItem href="https://jetpack.com/support/installing-jetpack/">
					{ translate( 'Install Jetpack manually' ) }
				</LoggedOutFormLinkItem>
				<HelpButton />
			</LoggedOutFormLinks>
		);
	}

	renderSiteInput( status ) {
		return (
			<Card className="jetpack-connect__site-url-input-container">
				{ this.props.renderNotices() }

				<SiteUrlInput
					url={ this.state.shownUrl }
					onTosClick={ this.handleOnClickTos }
					onChange={ this.handleUrlChange }
					onSubmit={ this.handleUrlSubmit }
					isError={ status }
					isFetching={
						this.props.isCurrentUrlFetching || this.state.redirecting || this.state.waitingForSites
					}
					isInstall={ true }
					product={ 'jetpack_search' }
					candidateSites={ this.state.candidateSites }
				/>
			</Card>
		);
	}

	renderLocaleSuggestions() {
		if ( this.props.isLoggedIn || ! this.props.locale ) {
			return;
		}

		return <LocaleSuggestions path={ this.props.path } locale={ this.props.locale } />;
	}

	render() {
		const { renderFooter, status } = this.props;

		return (
			<MainWrapper>
				{ this.renderLocaleSuggestions() }
				<div className="jetpack-connect__site-url-entry-container">
					<MainHeader type={ 'jetpack_search' } />

					{ this.renderSiteInput( status ) }
					{ renderFooter() }
				</div>
			</MainWrapper>
		);
	}
}

const connectComponent = connect(
	( state ) => {
		// Note: reading from a cookie here rather than redux state,
		// so any change in value will not execute connect().
		const mobileAppRedirect = retrieveMobileRedirect();
		const isMobileAppFlow = !! mobileAppRedirect;
		const jetpackConnectSite = getConnectingSite( state );
		const siteData = jetpackConnectSite.data || {};
		const sites = getSites( state );

		const skipRemoteInstall = siteData.skipRemoteInstall;

		return {
			// eslint-disable-next-line wpcalypso/redux-no-bound-selectors
			getJetpackSiteByUrl: ( url ) => getJetpackSiteByUrl( state, url ),
			isLoggedIn: !! getCurrentUserId( state ),
			isMobileAppFlow,
			isRequestingSites: isRequestingSites( state ),
			jetpackConnectSite,
			mobileAppRedirect,
			skipRemoteInstall,
			siteHomeUrl: siteData.urlAfterRedirects || jetpackConnectSite.url,
			sites,
		};
	},
	{
		checkUrl,
		dismissUrl,
		recordTracksEvent,
	}
);

export default flowRight(
	jetpackConnection,
	connectComponent,
	searchSites,
	localize
)( SearchPurchase );
