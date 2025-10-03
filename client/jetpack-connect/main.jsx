import { Card } from '@automattic/components';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import LocaleSuggestions from 'calypso/components/locale-suggestions';
import { FLOW_TYPES } from 'calypso/jetpack-connect/flow-types';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { checkUrl } from 'calypso/state/jetpack-connect/actions';
import { getJetpackSiteByUrl } from 'calypso/state/jetpack-connect/selectors';
import { isRequestingSites } from 'calypso/state/sites/selectors';
import jetpackConnection from './jetpack-connection';
import MainHeader from './main-header';
import MainWrapper from './main-wrapper';
import { persistSession } from './persistence-utils';
import SiteUrlInput from './site-url-input';
import { cleanUrl } from './utils';

export class JetpackConnectMain extends Component {
	static propTypes = {
		locale: PropTypes.string,
		path: PropTypes.string,
		type: PropTypes.oneOf( [ ...FLOW_TYPES, false ] ),
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

	componentDidMount() {
		if ( this.props.url ) {
			this.checkUrl( cleanUrl( this.props.url ) );
		}

		let from = 'direct';
		if ( this.props.type === 'install' ) {
			from = 'jpdotcom';
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

		// Set state to show spinner only if we're installing.
		// We don't want to show a spinner if user tries to connect a
		// site that's already connected before fetching sites.
		if ( this.props.isRequestingSites && this.isInstall() ) {
			this.setState( { waitingForSites: true } );
		} else {
			this.checkUrl( this.state.currentUrl );
		}
	};

	handleOnClickTos = () => this.props.recordTracksEvent( 'calypso_jpc_tos_link_click' );

	isInstall() {
		return FLOW_TYPES.includes( this.props.type );
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
					isFetching={ this.props.isCurrentUrlFetching || this.state.waitingForSites }
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
		const { renderFooter, status, type, canGoBack, goBack } = this.props;
		return (
			<MainWrapper useCompactLogo compactBackButton={ canGoBack && goBack }>
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
	( state ) => ( {
		// eslint-disable-next-line wpcalypso/redux-no-bound-selectors
		getJetpackSiteByUrl: ( url ) => getJetpackSiteByUrl( state, url ),
		isLoggedIn: isUserLoggedIn( state ),
		isRequestingSites: isRequestingSites( state ),
	} ),
	{ checkUrl, recordTracksEvent }
);

export default jetpackConnection( connectComponent( localize( JetpackConnectMain ) ) );
