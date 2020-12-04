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
import { Card } from '@automattic/components';
import ActivityLogRewindToggle from 'calypso/my-sites/activity/activity-log/activity-log-rewind-toggle';
import getRewindState from 'calypso/state/selectors/get-rewind-state';
import { submitSignupStep } from 'calypso/state/signup/progress/actions';

/**
 * Style dependencies
 */
import './style.scss';

class RewindMigrate extends Component {
	static propTypes = {
		flowName: PropTypes.string,
		goToNextStep: PropTypes.func.isRequired,
		positionInFlow: PropTypes.number,
		stepName: PropTypes.string,

		// Connected props
		siteId: PropTypes.number.isRequired,
		rewindIsNowActive: PropTypes.bool.isRequired,
	};

	/**
	 * Before component updates, check if we have to go somewhere else.
	 * If Rewind was activated, user clicked the Switch now button so let's go to migrate creds.
	 *
	 * @param {object} nextProps Props received by component for next update.
	 */
	UNSAFE_componentWillUpdate( nextProps ) {
		if ( this.props.rewindIsNowActive !== nextProps.rewindIsNowActive ) {
			this.props.submitSignupStep( { stepName: this.props.stepName }, { rewindconfig: true } );
			this.props.goToNextStep();
		}
	}

	stepContent() {
		const { translate, siteId } = this.props;

		return (
			<div className="rewind-migrate__card rewind-switch__card">
				<Card className="rewind-migrate__content rewind-switch__content">
					<h3 className="rewind-migrate__title rewind-switch__heading">
						{ translate( 'Migrate credentials' ) }
					</h3>
					<img src="/calypso/images/illustrations/almost-there.svg" alt="" />
					<p className="rewind-migrate__description rewind-switch__description">
						{ translate(
							"You've already configured VaultPress correctly, " +
								"so we're ready to migrate your credentials over to Jetpack with just one click. " +
								"Are you ready to switch to our faster, more powerful system? Let's go!"
						) }
					</p>
					<ActivityLogRewindToggle
						siteId={ siteId }
						label={ translate( 'Migrate your credentials' ) }
						isVpMigrate={ true }
					/>
				</Card>
				<div className="rewind-migrate__warning">
					<p>
						{ translate(
							'Note: Moving to Jetpack backups and security is final, ' +
								'and the VaultPress backups previously generated will not be migrated to the new system. ' +
								'We will retain the data in case you need to restore to a backup made before you switched.'
						) }
					</p>
				</div>
			</div>
		);
	}

	render() {
		return (
			<StepWrapper
				flowName={ this.props.flowName }
				stepName={ this.props.stepName }
				positionInFlow={ this.props.positionInFlow }
				stepContent={ this.stepContent() }
				hideFormattedHeader={ true }
				hideSkip={ true }
				hideBack={ true }
			/>
		);
	}
}

export default connect(
	( state, ownProps ) => {
		const siteId = parseInt( get( ownProps, [ 'initialContext', 'query', 'siteId' ], 0 ) );
		const rewindState = getRewindState( state, siteId );
		return {
			siteId,
			rewindIsNowActive: 'provisioning' === rewindState.state,
		};
	},
	{ submitSignupStep }
)( localize( RewindMigrate ) );
