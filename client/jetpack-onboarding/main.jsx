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
import Main from 'components/main';
import Wizard from 'components/wizard';
import {
	JETPACK_ONBOARDING_COMPONENTS as COMPONENTS,
	JETPACK_ONBOARDING_STEPS as STEPS,
} from './constants';
import { getJetpackOnboardingSettings, getUnconnectedSiteIdBySlug } from 'state/selectors';

class JetpackOnboardingMain extends React.PureComponent {
	static propTypes = {
		stepName: PropTypes.string,
	};

	static defaultProps = {
		stepName: STEPS.SITE_TITLE,
	};

	// TODO: Add lifecycle methods to redirect if no siteId

	render() {
		const { recordTracksEventForJpoSite, siteId, siteSlug, stepName, steps } = this.props;
		return (
			<Main className="jetpack-onboarding">
				<Wizard
					basePath="/jetpack/onboarding"
					baseSuffix={ siteSlug }
					components={ COMPONENTS }
					hideNavigation={ stepName === STEPS.SUMMARY }
					recordTracksEventForJpoSite={ recordTracksEventForJpoSite }
					siteId={ siteId }
					stepName={ stepName }
					steps={ steps }
				/>
			</Main>
		);
	}
}
export default connect(
	( state, { siteSlug } ) => {
		const siteId = getUnconnectedSiteIdBySlug( state, siteSlug );
		const settings = getJetpackOnboardingSettings( state, siteId );
		const isBusiness = get( settings, 'siteType' ) === 'business';

		// Note: here we can select which steps to display, based on user's input
		const steps = compact( [
			STEPS.SITE_TITLE,
			STEPS.SITE_TYPE,
			STEPS.HOMEPAGE,
			STEPS.CONTACT_FORM,
			isBusiness && STEPS.BUSINESS_ADDRESS,
			isBusiness && STEPS.WOOCOMMERCE,
			STEPS.SUMMARY,
		] );
		return {
			steps,
			siteId,
			siteSlug,
		};
	},
	{ recordTracksEvent },
	( { siteId, ...stateProps }, { recordTracksEvent: recordTracksEventAction }, ownProps ) => ( {
		siteId,
		...stateProps,
		recordTracksEventForJpoSite: event =>
			recordTracksEventAction( event, {
				blog_id: siteId,
				site_id_type: 'jpo',
			} ),
		...ownProps,
	} )
)( JetpackOnboardingMain );
