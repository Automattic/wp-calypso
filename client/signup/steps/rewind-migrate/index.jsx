/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import StepWrapper from 'signup/step-wrapper';
import Card from 'components/card';
import Button from 'components/button';
import SignupActions from 'lib/signup/actions';

class RewindMigrate extends Component {
	static propTypes = {
		flowName: PropTypes.string,
		goToNextStep: PropTypes.func.isRequired,
		positionInFlow: PropTypes.number,
		signupProgress: PropTypes.array,
		stepName: PropTypes.string,
	};

	/**
	 * Hits the endpoint to migrate the VP site to a Rewind site
	 *
	 * @returns {undefined}
	 */
	migrateCredentials = () => {
		SignupActions.submitSignupStep( {
			processingMessage: this.props.translate( 'Migrating your credentials' ),
			stepName: this.props.stepName,
		} );

		this.props.goToNextStep();
	};

	stepContent = () => {
		const { translate } = this.props;

		return [
			<Card key="rewind-migrate-main" className="rewind-migrate__card">
				<h3 className="rewind-migrate__title">{ translate( 'Migrate credentials' ) }</h3>
				<img src="/calypso/images/illustrations/almost-there.svg" alt="" />
				<p className="rewind-migrate__description">
					{ translate(
						"You've already configured VaultPress correctly, " +
							"so we're ready to migrate your credentials over to Jetpack with just one click." +
							"Are you ready to switch to our faster, more powerful system? Let's go!"
					) }
				</p>
				<Button primary onClick={ this.migrateCredentials }>
					{ translate( 'Migrate your credentials' ) }
				</Button>
			</Card>,
			<p key="rewind-migrate-warning">
				{ translate(
					'Note: Moving to Jetpack backups and security is final, ' +
						'and the VaultPress backups previously generated will not be migrated to the new system.' +
						'We will retain the data in case you need to restore to a backup made before you switched.'
				) }
			</p>,
		];
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

export default localize( RewindMigrate );
