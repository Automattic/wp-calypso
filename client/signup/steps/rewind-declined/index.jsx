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

class RewindDeclinedStep extends Component {
	static propTypes = {
		flowName: PropTypes.string,
		goToNextStep: PropTypes.func.isRequired,
		positionInFlow: PropTypes.number,
		signupProgress: PropTypes.array,
		stepName: PropTypes.string,
	};

	renderStepContent = () => {
		const { translate, wpAdminUrl } = this.props;

		return (
			<Card className="rewind-declined__card">
				<h3 className="rewind-declined__title">
					{ translate( 'Your site is set up and ready!' ) }
				</h3>
				<img
					alt="Thank You!"
					className="rewind-declined__image"
					src="/calypso/images/upgrades/thank-you.svg"
				/>
				<p className="rewind-declined__description">
					{ translate(
						'Your site is ready to go with your Jetpack plan. ' +
							'Finish setting up Jetpack to transform your site into the site of your dreams.'
					) }
				</p>
				<a className="rewind-declined__button button is-primary" href={ wpAdminUrl }>
					{ translate( 'Continue' ) }
				</a>
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
				stepContent={ this.renderStepContent() }
				goToNextStep={ this.skipStep }
				hideFormattedHeader={ true }
				hideBack={ true }
				hideSkip={ true }
			/>
		);
	}
}

export default connect( ( state, ownProps ) => {
	const blogId = get( ownProps, [ 'initialContext', 'query', 'blogid' ], 0 );
	const blogUrl = get( state, [ 'sites', 'items', blogId, 'URL' ], false );

	return {
		wpAdminUrl: blogUrl ? blogUrl + '/wp-admin/admin.php?page=jetpack#/dashboard' : false,
	};
}, null )( localize( RewindDeclinedStep ) );
