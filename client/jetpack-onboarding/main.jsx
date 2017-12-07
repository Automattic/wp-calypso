/** @format */
/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { compact } from 'lodash';
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

class JetpackOnboardingMain extends React.PureComponent {
	static propTypes = {
		stepName: PropTypes.string,
	};

	static defaultProps = {
		stepName: STEPS.SITE_TITLE,
	};

	render() {
		const { stepName, steps } = this.props;

		return (
			<Main className="jetpack-onboarding">
				<Wizard
					basePath="/jetpack/onboarding"
					components={ COMPONENTS }
					steps={ steps }
					stepName={ stepName }
				/>
			</Main>
		);
	}
}

export default connect( () => {
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

	return {
		steps,
	};
} )( JetpackOnboardingMain );
