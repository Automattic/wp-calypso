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
import StepWrapper from 'calypso/signup/step-wrapper';
import TileGrid from 'calypso/components/tile-grid';
import Tile from 'calypso/components/tile-grid/tile';
import { submitSignupStep } from 'calypso/state/signup/progress/actions';

/**
 * Style dependencies
 */
import './style.scss';

class CloneJetpackStep extends Component {
	static propTypes = {
		flowName: PropTypes.string,
		goToNextStep: PropTypes.func.isRequired,
		positionInFlow: PropTypes.number,
		stepName: PropTypes.string,
		signupDependencies: PropTypes.object,
	};

	selectNew = () => {
		this.props.submitSignupStep( { stepName: this.props.stepName }, { cloneJetpack: 'new' } );
		this.props.goToNextStep();
	};

	selectMigrate = () => {
		this.props.submitSignupStep( { stepName: this.props.stepName }, { cloneJetpack: 'migrate' } );
		this.props.goToNextStep();
	};

	renderStepContent() {
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
	}

	render() {
		const { flowName, stepName, positionInFlow, translate } = this.props;

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
				stepContent={ this.renderStepContent() }
			/>
		);
	}
}

export default connect(
	( state, ownProps ) => ( {
		originSiteName: get( ownProps, [ 'signupDependencies', 'originSiteName' ], '' ),
		destinationSiteName: get( ownProps, [ 'signupDependencies', 'destinationSiteName' ] ),
	} ),
	{ submitSignupStep }
)( localize( CloneJetpackStep ) );
