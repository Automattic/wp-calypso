/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import { get } from 'lodash';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import StepWrapper from 'signup/step-wrapper';
import Card from 'components/card';
import SectionHeader from 'components/section-header';
import SignupActions from 'lib/signup/actions';
import RewindCredentialsForm from 'components/rewind-credentials-form';
import getRewindState from 'state/selectors/get-rewind-state';
import getJetpackCredentialsUpdateStatus from 'state/selectors/get-jetpack-credentials-update-status';

class CloneCredentialsStep extends Component {
	static propTypes = {
		flowName: PropTypes.string,
		goToNextStep: PropTypes.func.isRequired,
		positionInFlow: PropTypes.number,
		signupProgress: PropTypes.array,
		stepName: PropTypes.string,
		signupDependencies: PropTypes.object,
	};

	state = {
		gotSuccess: false,
	};

	goToNextStep = () => {
		SignupActions.submitSignupStep(
			{ stepName: this.props.stepName },
			{
				roleName: 'alternate',
			}
		);

		this.props.goToNextStep();
	};

	renderStepContent = () => {
		const { destinationSiteName, destinationSiteUrl, originBlogId, translate } = this.props;

		return (
			<div>
				<SectionHeader
					label={ translate( 'Enter credentials for the destination site, %(site)s.', {
						args: { site: destinationSiteName },
					} ) }
				/>
				<Card className="clone-credentials__form">
					<RewindCredentialsForm
						role={ 'alternate' /* eslint-disable-line */ }
						siteId={ originBlogId }
						siteUrl={ destinationSiteUrl }
					/>
				</Card>
			</div>
		);
	};

	componentWillReceiveProps = nextProps => {
		if ( 'success' === nextProps.updateStatus && ! this.state.gotSuccess ) {
			this.setState( { gotSuccess: true } );
			this.goToNextStep();
		}
	};

	render() {
		const {
			flowName,
			stepName,
			positionInFlow,
			signupProgress,
			translate,
			originSiteName,
			destinationSiteName,
		} = this.props;

		const headerText = translate( 'Enter your server credentials' );
		const subHeaderText = translate(
			'In order to clone %(origin)s, we need the server credentials for %(destination)s.',
			{ args: { origin: originSiteName, destination: destinationSiteName } }
		);

		return (
			<StepWrapper
				className="clone-credentials"
				flowName={ flowName }
				stepName={ stepName }
				headerText={ headerText }
				fallbackHeaderText={ headerText }
				subHeaderText={ subHeaderText }
				fallbackSubHeaderText={ subHeaderText }
				positionInFlow={ positionInFlow }
				signupProgress={ signupProgress }
				stepContent={ this.renderStepContent() }
			/>
		);
	}
}

export default connect( ( state, ownProps ) => {
	const originSiteName = get( ownProps, [ 'signupDependencies', 'originSiteName' ], '' );
	const originBlogId = get( ownProps, [ 'signupDependencies', 'originBlogId' ] );
	const destinationSiteName = get( ownProps, [ 'signupDependencies', 'destinationSiteName' ] );
	const destinationSiteUrl = get( ownProps, [ 'signupDependencies', 'destinationSiteUrl' ] );

	return {
		originBlogId,
		originSiteName,
		destinationSiteName,
		destinationSiteUrl,
		rewind: getRewindState( state, originBlogId ),
		updateStatus: getJetpackCredentialsUpdateStatus( state, originBlogId ),
	};
} )( localize( CloneCredentialsStep ) );
