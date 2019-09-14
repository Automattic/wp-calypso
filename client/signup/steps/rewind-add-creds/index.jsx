/** @format */
/**
 * External dependencies
 */
import React, { Component, Fragment } from 'react';
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
import FormattedHeader from 'components/formatted-header';
import { submitSignupStep } from 'state/signup/progress/actions';

/**
 * Style dependencies
 */
import './style.scss';

class RewindAddCreds extends Component {
	static propTypes = {
		flowName: PropTypes.string,
		goToNextStep: PropTypes.func.isRequired,
		positionInFlow: PropTypes.number,
		stepName: PropTypes.string,

		// Connected props
		siteSlug: PropTypes.string.isRequired,
	};

	goToCredsForm = () => {
		this.props.submitSignupStep( {
			stepName: this.props.stepName,
		} );

		this.props.goToNextStep();
	};

	stepContent() {
		const { translate } = this.props;

		return (
			<Fragment>
				<FormattedHeader headerText={ translate( 'Add your credentials' ) } />
				<Card className="rewind-add-creds__card rewind-switch__card rewind-switch__content">
					<img src="/calypso/images/illustrations/security.svg" alt="" />
					<p className="rewind-add-creds__description rewind-switch__description">
						{ translate(
							'To activate Jetpack backups and security, please add your site credentials. ' +
								'WordPress.com will then be able to access your site to perform automatic backups, ' +
								'and to restore your site in case of an emergency.'
						) }
					</p>
					<Button primary className="rewind-add-creds__add-button" onClick={ this.goToCredsForm }>
						{ translate( 'Add your credentials' ) }
					</Button>
				</Card>
			</Fragment>
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
				hideBack={ false }
				backUrl={ `/activity-log/${ this.props.siteSlug }` }
				allowBackFirstStep={ true }
			/>
		);
	}
}

export default connect(
	( state, ownProps ) => {
		return {
			siteSlug: get( ownProps, [ 'initialContext', 'query', 'siteSlug' ], '' ),
		};
	},
	{ submitSignupStep }
)( localize( RewindAddCreds ) );
