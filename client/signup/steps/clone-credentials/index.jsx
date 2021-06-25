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
import StepWrapper from 'calypso/signup/step-wrapper';
import { Card } from '@automattic/components';
import SectionHeader from 'calypso/components/section-header';
import RewindCredentialsForm from 'calypso/components/rewind-credentials-form';
import getRewindState from 'calypso/state/selectors/get-rewind-state';
import getJetpackCredentialsUpdateStatus from 'calypso/state/selectors/get-jetpack-credentials-update-status';
import { submitSignupStep } from 'calypso/state/signup/progress/actions';

/**
 * Style dependencies
 */
import './style.scss';

class CloneCredentialsStep extends Component {
	static propTypes = {
		flowName: PropTypes.string,
		goToNextStep: PropTypes.func.isRequired,
		positionInFlow: PropTypes.number,
		stepName: PropTypes.string,
		signupDependencies: PropTypes.object,
	};

	state = {
		gotSuccess: false,
	};

	goToNextStep = () => {
		this.props.submitSignupStep( { stepName: this.props.stepName }, { roleName: 'alternate' } );
		this.props.goToNextStep();
	};

	renderStepContent() {
		const { destinationSiteName, destinationSiteUrl, originBlogId, translate } = this.props;

		return (
			<div>
				<SectionHeader
					label={ translate(
						'Make sure the credentials you enter are for the destination site, %(site)s.',
						{
							args: { site: destinationSiteName },
						}
					) }
				/>
				<Card className="clone-credentials__form">
					<RewindCredentialsForm
						role={ 'alternate' /* eslint-disable-line */ }
						siteId={ originBlogId }
						siteUrl={ destinationSiteUrl }
						labels={ {
							host: translate( 'Destination Server Address' ),
							path: translate( 'Destination WordPress Path' ),
						} }
						requirePath
					/>
				</Card>
			</div>
		);
	}

	UNSAFE_componentWillReceiveProps( nextProps ) {
		if ( 'success' === nextProps.updateStatus && ! this.state.gotSuccess ) {
			this.setState( { gotSuccess: true } );
			this.goToNextStep();
		}
	}

	render() {
		const { flowName, stepName, positionInFlow, translate, destinationSiteName } = this.props;

		const headerText = translate( 'Enter your server credentials' );
		const subHeaderText = translate(
			'Before we can start cloning your site, we need the server credentials for %(destination)s.',
			{ args: { destination: destinationSiteName } }
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
				stepContent={ this.renderStepContent() }
			/>
		);
	}
}

export default connect(
	( state, ownProps ) => {
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
	},
	{ submitSignupStep }
)( localize( CloneCredentialsStep ) );
