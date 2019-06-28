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
import SiteTopicForm from './form';
import StepWrapper from 'signup/step-wrapper';
import { getSiteType } from 'state/signup/steps/site-type/selectors';
import { getWpcomSiteTypeProp } from 'lib/signup/site-type';
import { getSiteVerticalIsUserInput } from 'state/signup/steps/site-vertical/selectors';
import { submitSiteVertical } from 'state/signup/steps/site-vertical/actions';
import { saveSignupStep } from 'state/signup/progress/actions';

class SiteTopicStep extends Component {
	static propTypes = {
		flowName: PropTypes.string,
		goToNextStep: PropTypes.func.isRequired,
		isUserInput: PropTypes.bool,
		positionInFlow: PropTypes.number.isRequired,
		submitSiteVertical: PropTypes.func.isRequired,
		signupProgress: PropTypes.array,
		stepName: PropTypes.string,
		siteType: PropTypes.string,
		translate: PropTypes.func.isRequired,
	};

	static defaultProps = {
		isUserInput: true,
	};

	componentDidMount() {
		this.props.saveSignupStep( { stepName: this.props.stepName } );
	}

	submitSiteTopic = ( { isUserInput, name, slug } ) => {
		const { flowName, stepName } = this.props;
		this.props.submitSiteVertical( { isUserInput, name, slug }, stepName );
		this.props.goToNextStep( flowName );
	};

	render() {
		const {
			flowName,
			positionInFlow,
			showSiteMockups,
			signupProgress,
			siteType,
			stepName,
		} = this.props;
		const headerText = getWpcomSiteTypeProp( siteType, 'siteTopicHeader' ) || '';
		const subHeaderText = getWpcomSiteTypeProp( siteType, 'siteTopicSubheader' ) || '';
		const searchInputPlaceholder = getWpcomSiteTypeProp( siteType, 'siteTopicInputPlaceholder' );
		const searchInputLabel = getWpcomSiteTypeProp( siteType, 'siteTopicLabel' );
		const defaultVerticalSearchTerm = getWpcomSiteTypeProp( siteType, 'defaultVertical' );

		return (
			<div>
				<StepWrapper
					flowName={ flowName }
					stepName={ stepName }
					positionInFlow={ positionInFlow }
					headerText={ headerText }
					fallbackHeaderText={ headerText }
					subHeaderText={ subHeaderText }
					fallbackSubHeaderText={ subHeaderText }
					signupProgress={ signupProgress }
					stepContent={
						<SiteTopicForm
							defaultVerticalSearchTerm={ defaultVerticalSearchTerm }
							labelText={ searchInputLabel }
							placeholder={ searchInputPlaceholder }
							submitForm={ this.submitSiteTopic }
							siteType={ siteType }
						/>
					}
					showSiteMockups={ showSiteMockups }
				/>
			</div>
		);
	}
}

export default connect(
	state => ( {
		siteType: getSiteType( state ),
		isUserInput: getSiteVerticalIsUserInput( state ),
	} ),
	{ saveSignupStep, submitSiteVertical }
)( localize( SiteTopicStep ) );
