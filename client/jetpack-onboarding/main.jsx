/** @format */
/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { compact, findKey } from 'lodash';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import Wizard from 'components/wizard';
import {
	JETPACK_ONBOARDING_COMPONENTS as COMPONENTS,
	JETPACK_ONBOARDING_STEPS as STEPS,
} from './constants';
import { urlToSlug } from 'lib/url';

class JetpackOnboardingMain extends React.PureComponent {
	static propTypes = {
		stepName: PropTypes.string,
	};

	static defaultProps = {
		stepName: STEPS.SITE_TITLE,
	};

	// TODO: Add lifecycle methods to redirect if no siteId

	render() {
		const { siteSlug, stepName, steps } = this.props;

		return (
			<Main className="jetpack-onboarding">
				<Wizard
					basePath="/jetpack/onboarding"
					baseSuffix={ siteSlug }
					components={ COMPONENTS }
					steps={ steps }
					stepName={ stepName }
					hideNavigation={ stepName === STEPS.SUMMARY }
				/>
			</Main>
		);
	}
}

export default connect( ( state, { siteSlug } ) => {
	// Note: here we can select which steps to display, based on user's input
	const steps = compact( [
		STEPS.SITE_TITLE,
		STEPS.SITE_TYPE,
		STEPS.HOMEPAGE,
		STEPS.CONTACT_FORM,
		STEPS.BUSINESS_ADDRESS,
		STEPS.WOOCOMMERCE,
		STEPS.SUMMARY,
	] );

	// TODO: Make into selector
	const siteId = findKey( state.jetpackOnboarding.credentials, ( { siteUrl } ) => {
		return siteSlug === urlToSlug( siteUrl );
	} );

	return {
		siteId,
		siteSlug,
		steps,
	};
} )( JetpackOnboardingMain );
