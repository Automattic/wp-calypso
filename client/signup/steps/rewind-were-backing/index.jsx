/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import StepWrapper from 'signup/step-wrapper';
import Card from 'components/card';
import Button from 'components/button';
import { getSignupDependencies } from 'state/signup/dependency-store/selectors';

class RewindWereBacking extends Component {
	static propTypes = {
		flowName: PropTypes.string,
		goToNextStep: PropTypes.func.isRequired,
		positionInFlow: PropTypes.number,
		signupProgress: PropTypes.array,
		stepName: PropTypes.string,

		// Connected props
		siteSlug: PropTypes.string.isRequired,
		signupDependencies: PropTypes.object,
	};

	stepContent = () => {
		const { translate, siteSlug, signupDependencies } = this.props;

		return (
			<Card className="rewind-were-backing__card rewind-switch__card rewind-switch__content">
				<h3 className="rewind-were-backing__title rewind-switch__heading">
					{ translate( 'Your site is set up and ready!' ) }
				</h3>
				<img src="/calypso/images/illustrations/thankYou.svg" alt="" />
				<p className="rewind-were-backing__description rewind-switch__description">
					{ get( signupDependencies, 'rewindconfig', false ) &&
						translate(
							'Your site is being backed up because it is set up with ' +
								'Jetpack Premium at no additional cost to you.'
						) + ' ' }
					{ translate(
						'Finish setting up Jetpack and your site is ready to be ' +
							'transformed into the site of your dreams.'
					) }
				</p>
				<Button primary href={ `/stats/activity/${ siteSlug }` }>
					{ translate( 'View your activity' ) }
				</Button>
			</Card>
		);
	};

	render() {
		return (
			<StepWrapper
				flowName={ this.props.flowName }
				stepName={ this.props.stepName }
				positionInFlow={ this.props.positionInFlow }
				signupProgress={ this.props.signupProgress }
				stepContent={ this.stepContent() }
				hideFormattedHeader={ true }
				hideSkip={ true }
				hideBack={ true }
			/>
		);
	}
}

export default connect(
	( state, ownProps ) => ( {
		siteSlug: get( ownProps, [ 'initialContext', 'query', 'siteSlug' ], 0 ),
		signupDependencies: getSignupDependencies( state ),
	} ),
	null
)( localize( RewindWereBacking ) );
