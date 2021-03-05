/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { concat, flowRight, includes } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { Card } from '@automattic/components';
import LocaleSuggestions from 'calypso/components/locale-suggestions';
import MainHeader from './main-header';
import MainWrapper from './main-wrapper';
import SiteUrlInput from './site-url-input';
import { cleanUrl } from './utils';
import { checkUrl } from 'calypso/state/jetpack-connect/actions';
import { FLOW_TYPES } from 'calypso/jetpack-connect/flow-types';
import { getJetpackSiteByUrl } from 'calypso/state/jetpack-connect/selectors';
import { getCurrentUserId } from 'calypso/state/current-user/selectors';
import { isRequestingSites } from 'calypso/state/sites/selectors';
import { persistSession } from './persistence-utils';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import jetpackConnection from './jetpack-connection';

export class JetpackConnectMain extends Component {
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
		  }
		: {
				currentUrl: '',
				shownUrl: '',
				waitingForSites: false,
		  };

	UNSAFE_componentWillMount() {
		if ( this.props.url ) {
			this.checkUrl( cleanUrl( this.props.url ) );
		}
	}

	componentDidMount() {
		let from = 'direct';
		if ( this.props.type === 'install' ) {
			from = 'jpdotcom';
		}
		if ( this.props.type === 'pro' ) {
			from = 'ad';
		}
		if ( this.props.type === 'premium' ) {
			from = 'ad';
		}
		if ( this.props.type === 'personal' ) {
			from = 'ad';
		}

		this.props.recordTracksEvent( 'calypso_jpc_url_view', {
			jpc_from: from,
			cta_id: this.props.ctaId,
			cta_from: this.props.ctaFrom,
		} );
	}

	componentDidUpdate() {
		const { processJpSite } = this.props;
		const { currentUrl } = this.state;

		processJpSite( currentUrl );
	}

	handleUrlChange = ( event ) => {
		const url = event.target.value;
		this.setState( {
			currentUrl: cleanUrl( url ),
			shownUrl: url,
		} );
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

	isInstall() {
		return includes( FLOW_TYPES, this.props.type );
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
					isInstall={ this.isInstall() }
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
		const { renderFooter, status, type } = this.props;
		return (
			<MainWrapper>
				{ this.renderLocaleSuggestions() }
				<div className="jetpack-connect__site-url-entry-container">
					<MainHeader type={ type } />
					{ this.renderSiteInput( status ) }
					{ renderFooter() }
				</div>
			</MainWrapper>
		);
	}
}

const connectComponent = connect(
	( state ) => {
		return {
			// eslint-disable-next-line wpcalypso/redux-no-bound-selectors
			getJetpackSiteByUrl: ( url ) => getJetpackSiteByUrl( state, url ),
			isLoggedIn: !! getCurrentUserId( state ),
			isRequestingSites: isRequestingSites( state ),
		};
	},
	{
		checkUrl,
		recordTracksEvent,
	}
);

export default flowRight( jetpackConnection, connectComponent, localize )( JetpackConnectMain );
