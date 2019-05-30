/** @format */

/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import SignupActions from 'lib/signup/actions';
import SiteTopicForm from './form';
import StepWrapper from 'signup/step-wrapper';
import { getSiteType } from 'state/signup/steps/site-type/selectors';
import { getSiteTypePropertyValue } from 'lib/signup/site-type';
import { getSiteVerticalIsUserInput } from 'state/signup/steps/site-vertical/selectors';
import { submitSiteVertical } from 'state/signup/steps/site-vertical/actions';

class SiteTopicStep extends Component {
	static propTypes = {
		flowName: PropTypes.string,
		goToNextStep: PropTypes.func.isRequired,
		isUserInput: PropTypes.bool,
		positionInFlow: PropTypes.number.isRequired,
		submitSiteTopic: PropTypes.func.isRequired,
		signupProgress: PropTypes.array,
		stepName: PropTypes.string,
		siteType: PropTypes.string,
		translate: PropTypes.func.isRequired,
	};

	static defaultProps = {
		isUserInput: true,
	};

	componentDidMount() {
		SignupActions.saveSignupStep( {
			stepName: this.props.stepName,
		} );
	}

	render() {
		const headerText =
			getSiteTypePropertyValue( 'slug', this.props.siteType, 'siteTopicHeader' ) || '';
		const subHeaderText =
			getSiteTypePropertyValue( 'slug', this.props.siteType, 'siteTopicSubheader' ) || '';

		return (
			<div>
				<StepWrapper
					flowName={ this.props.flowName }
					stepName={ this.props.stepName }
					positionInFlow={ this.props.positionInFlow }
					headerText={ headerText }
					fallbackHeaderText={ headerText }
					subHeaderText={ subHeaderText }
					fallbackSubHeaderText={ subHeaderText }
					signupProgress={ this.props.signupProgress }
					stepContent={ <SiteTopicForm submitForm={ this.props.submitSiteTopic } /> }
					showSiteMockups={ this.props.showSiteMockups }
				/>
			</div>
		);
	}
}

const mapDispatchToProps = ( dispatch, ownProps ) => ( {
	submitSiteTopic: ( { isUserInput, name, slug } ) => {
		const { flowName, goToNextStep, stepName } = ownProps;

		dispatch(
			submitSiteVertical(
				{
					isUserInput,
					name,
					slug,
				},
				stepName
			)
		);

		goToNextStep( flowName );
	},
} );

export default connect(
	state => ( {
		siteType: getSiteType( state ),
		isUserInput: getSiteVerticalIsUserInput( state ),
	} ),
	mapDispatchToProps
)( localize( SiteTopicStep ) );
