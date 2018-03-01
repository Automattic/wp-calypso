/** @format */
/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { compact, get } from 'lodash';
import { connect } from 'react-redux';
import { recordTracksEvent } from 'state/analytics/actions';

/**
 * Internal dependencies
 */
import config from 'config';
import Main from 'components/main';
import QueryJetpackOnboardingSettings from 'components/data/query-jetpack-onboarding-settings';
import Wizard from 'components/wizard';
import { addQueryArgs, externalRedirect } from 'lib/route';
import {
	JETPACK_ONBOARDING_COMPONENTS as COMPONENTS,
	JETPACK_ONBOARDING_STEPS as STEPS,
} from './constants';
import {
	getJetpackOnboardingSettings,
	getRequest,
	getUnconnectedSite,
	getUnconnectedSiteUserHash,
	getUnconnectedSiteIdBySlug,
} from 'state/selectors';
import { isJetpackSite, isRequestingSite, isRequestingSites } from 'state/sites/selectors';
import {
	requestJetpackOnboardingSettings,
	saveJetpackOnboardingSettings,
} from 'state/jetpack-onboarding/actions';

class JetpackOnboardingMain extends React.PureComponent {
	static propTypes = {
		stepName: PropTypes.string,
	};

	static defaultProps = {
		stepName: STEPS.SITE_TITLE,
	};

	state = { hasFinishedRequestingSite: false };

	componentDidMount() {
		const { siteId, siteSlug } = this.props;

		// If we are missing the Jetpack onboarding credentials,
		// redirect back to wp-admin so we can obtain them again.
		if ( ! siteId && siteSlug ) {
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

	componentWillReceiveProps( nextProps ) {
		if ( this.props.isRequestingWhetherConnected && ! nextProps.isRequestingWhetherConnected ) {
			this.setState( { hasFinishedRequestingSite: true } );
		}
	}

	getNavigationLinkClickHandler = direction => () => {
		const { recordJpoEvent, stepName } = this.props;

		recordJpoEvent( 'calypso_jpo_navigation_link_clicked', {
			current_step: stepName,
			direction,
		} );
	};

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
		} = this.props;
		return (
			<Main className="jetpack-onboarding">
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
					<div className="jetpack-onboarding__loading wpcom-site__logo noticon noticon-wordpress" />
				) }
			</Main>
		);
	}
}
export default connect(
	( state, { siteSlug } ) => {
		const siteId = getUnconnectedSiteIdBySlug( state, siteSlug );
		const settings = getJetpackOnboardingSettings( state, siteId );
		const isBusiness = get( settings, 'siteType' ) === 'business';

		const isRequestingWhetherConnected =
			isRequestingSite( state, siteId ) || isRequestingSites( state );
		const isConnected = isJetpackSite( state, siteId );

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
		// Note: here we can select which steps to display, based on user's input
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
		return {
			jpoAuth,
			isRequestingSettings,
			isRequestingWhetherConnected,
			siteId,
			siteSlug,
			settings,
			steps,
			userIdHashed,
		};
	},
	{ recordTracksEvent, saveJetpackOnboardingSettings },
	(
		{ siteId, jpoAuth, userIdHashed, ...stateProps },
		{
			recordTracksEvent: recordTracksEventAction,
			saveJetpackOnboardingSettings: saveJetpackOnboardingSettingsAction,
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
		...ownProps,
	} )
)( JetpackOnboardingMain );
