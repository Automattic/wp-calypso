/** @format */
/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { compact, get } from 'lodash';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { recordTracksEvent } from 'state/analytics/actions';

/**
 * Internal dependencies
 */
import config from 'config';
import DocumentHead from 'components/data/document-head';
import Main from 'components/main';
import QueryJetpackOnboardingSettings from 'components/data/query-jetpack-onboarding-settings';
import Wizard from 'components/wizard';
import WordPressLogo from 'components/wordpress-logo';
import { addQueryArgs, externalRedirect } from 'lib/route';
import {
	JETPACK_ONBOARDING_COMPONENTS as COMPONENTS,
	JETPACK_ONBOARDING_STEPS as STEPS,
	JETPACK_ONBOARDING_STEP_TITLES as STEP_TITLES,
} from './constants';
import {
	getJetpackOnboardingCompletedSteps,
	getJetpackOnboardingSettings,
	getRequest,
	getSiteId,
	getUnconnectedSite,
	getUnconnectedSiteUserHash,
	getUnconnectedSiteIdBySlug,
} from 'state/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import { isJetpackSite, isRequestingSite, isRequestingSites } from 'state/sites/selectors';
import {
	requestJetpackOnboardingSettings,
	saveJetpackOnboardingSettings,
} from 'state/jetpack-onboarding/actions';
import { setSelectedSiteId } from 'state/ui/actions';

class JetpackOnboardingMain extends React.PureComponent {
	static propTypes = {
		stepName: PropTypes.string,
	};

	static defaultProps = {
		stepName: STEPS.SITE_TITLE,
	};

	state = { hasFinishedRequestingSite: false };

	componentDidMount() {
		this.retrieveOnboardingCredentials();
		this.setSelectedSite();
	}

	componentDidUpdate() {
		this.retrieveOnboardingCredentials();
		this.setSelectedSite();
	}

	componentWillReceiveProps( nextProps ) {
		if ( this.props.isRequestingWhetherConnected && ! nextProps.isRequestingWhetherConnected ) {
			this.setState( { hasFinishedRequestingSite: true } );
		}
	}

	retrieveOnboardingCredentials() {
		const { isConnected, siteId, siteSlug } = this.props;
		const { hasFinishedRequestingSite } = this.state;

		// If we are not connected and missing the Jetpack onboarding credentials,
		// redirect back to wp-admin so we can obtain them again.
		if ( hasFinishedRequestingSite && ! isConnected && ! siteId && siteSlug ) {
			const siteDomain = siteSlug.replace( '::', '/' );
			const url = addQueryArgs(
				{
					page: 'jetpack',
					action: 'onboard',
					calypso_env: config( 'env_id' ),
				},
				`//${ siteDomain }/wp-admin/admin.php`
			);
			externalRedirect( url );
		}
	}

	setSelectedSite() {
		const { hasFinishedRequestingSite } = this.state;
		const { isConnected, isSiteSelected, siteId } = this.props;

		if ( ! hasFinishedRequestingSite ) {
			return;
		}

		if ( isConnected && ! isSiteSelected ) {
			// If the site we're onboarding is connected and not selected, select it
			this.props.setSelectedSiteId( siteId );
		}
	}

	getNavigationLinkClickHandler = direction => () => {
		const { recordJpoEvent, stepName } = this.props;

		recordJpoEvent( 'calypso_jpo_navigation_link_clicked', {
			current_step: stepName,
			direction,
		} );
	};

	getSkipLinkText() {
		const { stepName, stepsCompleted, translate } = this.props;

		if ( get( stepsCompleted, stepName ) ) {
			return translate( 'Next' );
		}
		return null;
	}

	render() {
		const {
			action,
			isRequestingSettings,
			isRequestingWhetherConnected,
			jpoAuth,
			recordJpoEvent,
			saveJpoSettings,
			settings,
			siteId,
			siteSlug,
			stepName,
			steps,
			translate,
		} = this.props;

		return (
			<Main className="jetpack-onboarding">
				<DocumentHead
					title={ get( STEP_TITLES, stepName ) + ' ‹ ' + translate( 'Jetpack Start' ) }
				/>
				{ /* We only allow querying of site settings once we know that we have finished
				   * querying data for the given site. The `jpoAuth` connected prop depends on whether
				   * the site is a connected Jetpack site or not, and a network request that uses
				   * the wrong argument can mess up our request tracking quite badly. */
				this.state.hasFinishedRequestingSite && (
					<QueryJetpackOnboardingSettings query={ jpoAuth } siteId={ siteId } />
				) }
				{ siteId ? (
					<Wizard
						action={ action }
						basePath="/jetpack/start"
						baseSuffix={ siteSlug }
						components={ COMPONENTS }
						forwardText={ this.getSkipLinkText() }
						hideNavigation={ stepName === STEPS.SUMMARY }
						isRequestingSettings={ isRequestingSettings }
						isRequestingWhetherConnected={ isRequestingWhetherConnected }
						onBackClick={ this.getNavigationLinkClickHandler( 'back' ) }
						onForwardClick={ this.getNavigationLinkClickHandler( 'forward' ) }
						recordJpoEvent={ recordJpoEvent }
						saveJpoSettings={ saveJpoSettings }
						siteId={ siteId }
						siteSlug={ siteSlug }
						settings={ settings }
						stepName={ stepName }
						steps={ steps }
					/>
				) : (
					<WordPressLogo size={ 72 } className="jetpack-onboarding__loading wpcom-site__logo" />
				) }
			</Main>
		);
	}
}
export default connect(
	( state, { action, siteSlug } ) => {
		let siteId = getUnconnectedSiteIdBySlug( state, siteSlug );
		if ( ! siteId ) {
			// We rely on the fact that all sites are being requested automatically early in <Layout />.
			// If sites aren't loaded, we'll consider that the site is not connected,
			// which will always result in redirecting to wp-admin to obtain the onboarding credentials.
			siteId = getSiteId( state, siteSlug );
		}

		const settings = getJetpackOnboardingSettings( state, siteId );
		const isBusiness = get( settings, 'siteType' ) === 'business';

		const isRequestingWhetherConnected =
			isRequestingSite( state, siteId ) || isRequestingSites( state );
		const isConnected = isJetpackSite( state, siteId );
		const selectedSiteId = getSelectedSiteId( state );
		const isSiteSelected = selectedSiteId === siteId;

		let jpoAuth;

		if ( ! isConnected && getUnconnectedSite( state, siteId ) ) {
			const { token, userEmail: jpUser } = getUnconnectedSite( state, siteId );
			jpoAuth = {
				onboarding: {
					token,
					jpUser,
				},
			};
		}

		const isRequestingSettings = getRequest(
			state,
			requestJetpackOnboardingSettings( siteId, jpoAuth )
		).isLoading;

		const userIdHashed = getUnconnectedSiteUserHash( state, siteId );

		// Only show the Stats Step either if we aren't connected to WP.com yet,
		// or if we're just being redirected back to JP Onboarding right after
		// going through JP Connect, in which case the `action` query arg will be
		// set to `activate_stats`.
		const showStatsStep = ! isConnected || action === 'activate_stats';

		const steps = compact( [
			STEPS.SITE_TITLE,
			STEPS.SITE_TYPE,
			STEPS.HOMEPAGE,
			STEPS.CONTACT_FORM,
			isBusiness && STEPS.BUSINESS_ADDRESS,
			isBusiness && STEPS.WOOCOMMERCE,
			showStatsStep && STEPS.STATS,
			STEPS.SUMMARY,
		] );
		const stepsCompleted = getJetpackOnboardingCompletedSteps( state, siteId, steps );

		return {
			jpoAuth,
			isConnected,
			isRequestingSettings,
			isRequestingWhetherConnected,
			isSiteSelected,
			siteId,
			siteSlug,
			settings,
			steps,
			stepsCompleted,
			userIdHashed,
		};
	},
	{ recordTracksEvent, saveJetpackOnboardingSettings, setSelectedSiteId },
	(
		{ siteId, jpoAuth, userIdHashed, ...stateProps },
		{
			recordTracksEvent: recordTracksEventAction,
			saveJetpackOnboardingSettings: saveJetpackOnboardingSettingsAction,
			...dispatchProps
		},
		ownProps
	) => ( {
		jpoAuth,
		siteId,
		...stateProps,
		recordJpoEvent: ( event, additionalProperties ) =>
			recordTracksEventAction( event, {
				blog_id: siteId,
				site_id_type: 'jpo',
				user_id: 'jpo_user_' + userIdHashed,
				id: siteId + '_' + userIdHashed,
				...additionalProperties,
			} ),
		saveJpoSettings: ( s, settings ) =>
			saveJetpackOnboardingSettingsAction( s, {
				onboarding: { ...settings, ...get( jpoAuth, 'onboarding' ) },
			} ),
		...dispatchProps,
		...ownProps,
	} )
)( localize( JetpackOnboardingMain ) );
