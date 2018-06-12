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
import SignupActions from 'lib/signup/actions';
import TileGrid from 'components/tile-grid';
import Tile from 'components/tile-grid/tile';

class CloneJetpackStep extends Component {
	static propTypes = {
		flowName: PropTypes.string,
		goToNextStep: PropTypes.func.isRequired,
		positionInFlow: PropTypes.number,
		signupProgress: PropTypes.array,
		stepName: PropTypes.string,
		signupDependencies: PropTypes.object,
	};

	selectNew = () => {
		SignupActions.submitSignupStep(
			{ stepName: this.props.stepName },
			{
				cloneJetpack: 'new',
			}
		);

		this.props.goToNextStep();
	};

	selectMigrate = () => {
		SignupActions.submitSignupStep(
			{ stepName: this.props.stepName },
			{
				cloneJetpack: 'migrate',
			}
		);

		this.props.goToNextStep();
	};

	renderStepContent = () => {
		const { originSiteName, destinationSiteName, translate } = this.props;

		return (
			<TileGrid>
				<Tile
					className="clone-jetpack__keep"
					buttonLabel={ 'Keep plan where it is' }
					description={ translate( 'Your plan would remain on %(originSiteName)s.', {
						args: { originSiteName },
					} ) }
					image={ '/calypso/images/illustrations/jetpack-connection.svg' }
					onClick={ this.selectNew }
				/>
				<Tile
					className="clone-jetpack__migrate"
					buttonLabel={ 'Migrate Jetpack plan' }
					description={ translate(
						'Your Jetpack plan would be migrated to the destination site, %(destinationSiteName)s.',
						{
							args: { destinationSiteName },
						}
					) }
					image={ '/calypso/images/illustrations/jetpack-connection-migration.svg' }
					onClick={ this.selectMigrate }
				/>
			</TileGrid>
		);
	};

	render() {
		const { flowName, stepName, positionInFlow, signupProgress, translate } = this.props;

		const headerText = translate( 'Your Jetpack connection' );
		const subHeaderText = translate(
			'What would you like us to do with your Jetpack connection and plan?'
		);

		return (
			<StepWrapper
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
	return {
		originSiteName: get( ownProps, [ 'signupDependencies', 'originSiteName' ], '' ),
		destinationSiteName: get( ownProps, [ 'signupDependencies', 'destinationSiteName' ] ),
	};
} )( localize( CloneJetpackStep ) );
