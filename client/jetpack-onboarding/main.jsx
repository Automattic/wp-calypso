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
	getUnconnectedSiteUserHash,
	getUnconnectedSiteIdBySlug,
} from 'state/selectors';
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
				<QueryJetpackOnboardingSettings siteId={ siteId } />
				{ siteId ? (
					<Wizard
						action={ action }
						basePath="/jetpack/start"
						baseSuffix={ siteSlug }
						components={ COMPONENTS }
						hideNavigation={ stepName === STEPS.SUMMARY }
						isRequestingSettings={ isRequestingSettings }
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
		const isRequestingSettings = getRequest( state, requestJetpackOnboardingSettings( siteId ) )
			.isLoading;

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
			isRequestingSettings,
			siteId,
			siteSlug,
			settings,
			steps,
			userIdHashed,
		};
	},
	{ recordTracksEvent, saveJetpackOnboardingSettings },
	(
		{ siteId, userIdHashed, ...stateProps },
		{
			recordTracksEvent: recordTracksEventAction,
			saveJetpackOnboardingSettings: saveJetpackOnboardingSettingsAction,
		},
		ownProps
	) => ( {
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
		saveJpoSettings: saveJetpackOnboardingSettingsAction,
		...ownProps,
	} )
)( JetpackOnboardingMain );
