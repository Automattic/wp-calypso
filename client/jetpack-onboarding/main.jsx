/** @format */
/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { compact, get, includes } from 'lodash';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { recordTracksEvent } from 'state/analytics/actions';

/**
 * Internal dependencies
 */
import config from 'config';
import DocumentHead from 'components/data/document-head';
import Main from 'components/main';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import QueryJetpackSettings from 'components/data/query-jetpack-settings';
import QuerySites from 'components/data/query-sites';
import Wizard from 'components/wizard';
import WordPressLogo from 'components/wordpress-logo';
import { addQueryArgs, externalRedirect } from 'lib/route';
import {
	JETPACK_ONBOARDING_ANALYTICS_TITLES as ANALYTICS_TITLES,
	JETPACK_ONBOARDING_COMPONENTS as COMPONENTS,
	JETPACK_ONBOARDING_STEPS as STEPS,
	JETPACK_ONBOARDING_STEP_TITLES as STEP_TITLES,
} from './constants';
import getJetpackOnboardingCompletedSteps from 'state/selectors/get-jetpack-onboarding-completed-steps';
import getJetpackOnboardingSettings from 'state/selectors/get-jetpack-onboarding-settings';
import getJpoUserHash from 'state/selectors/get-jpo-user-hash';
import getSiteId from 'state/selectors/get-site-id';
import getUnconnectedSite from 'state/selectors/get-unconnected-site';
import getUnconnectedSiteIdBySlug from 'state/selectors/get-unconnected-site-id-by-slug';
import isRequestingJetpackSettings from 'state/selectors/is-requesting-jetpack-settings';
import { getSelectedSiteId } from 'state/ui/selectors';
import { isJetpackSite, isRequestingSite, isRequestingSites } from 'state/sites/selectors';
import { saveJetpackSettings } from 'state/jetpack/settings/actions';
import { setSelectedSiteId } from 'state/ui/actions';

/**
 * Style dependencies
 */
import './style.scss';

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

	shouldHideForwardLink() {
		const { stepName, stepsCompleted } = this.props;
		const stepsWithSuccessScreens = [ STEPS.CONTACT_FORM, STEPS.BUSINESS_ADDRESS, STEPS.STATS ];

		if ( ! includes( stepsWithSuccessScreens, stepName ) ) {
			return false;
		}

		return get( stepsCompleted, stepName, false );
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
		const basePath = '/jetpack/start';
		const pageTitle = get( STEP_TITLES, stepName ) + ' ‹ ' + translate( 'Jetpack Start' );
		const analyticsPageTitle = get( ANALYTICS_TITLES, stepName ) + ' ‹ ' + 'Jetpack Start';

		return (
			<Main className="jetpack-onboarding">
				<DocumentHead title={ pageTitle } />
				<PageViewTracker
					path={ [ basePath, stepName, ':site' ].join( '/' ) }
					title={ analyticsPageTitle }
				/>

				{ /* It is important to use `<QuerySites siteId={siteSlug} />` here, however wrong that seems.
				 * The reason is that we rely on an `isRequestingSite()` check to tell whether we've
				 * finished fetching site details, which will tell us whether the site is connected,
				 * which we need in turn to conditionally send JPO auth credentials (see below).
				 * However, if we're logged out, we cannot `<QuerySites allSites />`,
				 * since the concept of "all of a user's sites" doesn't make sense if there is no user.
				 * We also cannot `<QuerySites siteId={ siteId } />` prior to having obtained the `siteId`
				 * through JPO -- a Catch-22 situation.
				 * Fortunately, querying by `siteSlug` works, since it's supported by underlying actions. */ }
				<QuerySites siteId={ siteSlug } />
				{ /* We only allow querying of site settings once we know that we have finished
				 * querying data for the given site. The `jpoAuth` connected prop depends on whether
				 * the site is a connected Jetpack site or not, and a network request that uses
				 * the wrong argument can mess up our request tracking quite badly. */
				this.state.hasFinishedRequestingSite && (
					<QueryJetpackSettings query={ jpoAuth } siteId={ siteId } />
				) }
				{ siteId ? (
					<Wizard
						action={ action }
						basePath={ basePath }
						baseSuffix={ siteSlug }
						components={ COMPONENTS }
						hideForwardLink={ this.shouldHideForwardLink() }
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
	( state, { siteSlug } ) => {
		let siteId = getUnconnectedSiteIdBySlug( state, siteSlug );
		if ( ! siteId ) {
			// We rely on the fact that all sites are being requested automatically early in <Layout />.
			// If sites aren't loaded, we'll consider that the site is not connected,
			// which will always result in redirecting to wp-admin to obtain the onboarding credentials.
			siteId = getSiteId( state, siteSlug );
		}

		const settings = getJetpackOnboardingSettings( state, siteId );
		const isBusiness = get( settings, 'siteType' ) === 'business';

		// We really want `isRequestingSite( state, siteSlug )` (not `siteId`).
		// For the rationale, see the comment right above the `<QuerySites />` component
		// further up in this file.
		const isRequestingWhetherConnected =
			isRequestingSite( state, siteSlug ) || isRequestingSites( state );
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

		const isRequestingSettings = isRequestingJetpackSettings( state, siteId, jpoAuth );

		const userIdHashed = getJpoUserHash( state, siteId );

		const steps = compact( [
			STEPS.SITE_TITLE,
			STEPS.SITE_TYPE,
			STEPS.HOMEPAGE,
			STEPS.CONTACT_FORM,
			isBusiness && STEPS.BUSINESS_ADDRESS,
			isBusiness && STEPS.WOOCOMMERCE,
			STEPS.STATS,
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
	{ recordTracksEvent, saveJetpackSettings, setSelectedSiteId },
	(
		{ siteId, jpoAuth, userIdHashed, ...stateProps },
		{
			recordTracksEvent: recordTracksEventAction,
			saveJetpackSettings: saveJetpackSettingsAction,
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
			saveJetpackSettingsAction( s, {
				onboarding: { ...settings, ...get( jpoAuth, 'onboarding' ) },
			} ),
		...dispatchProps,
		...ownProps,
	} )
)( localize( JetpackOnboardingMain ) );
