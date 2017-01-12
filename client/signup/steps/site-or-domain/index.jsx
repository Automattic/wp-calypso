/**
 * External dependencies
 */
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import StepWrapper from 'signup/step-wrapper';
import SignupActions from 'lib/signup/actions';
import Card from 'components/card';

export default class SiteOrDomain extends Component {
	getChoices() {
		return [
			{
				type: 'page',
				label: 'Start a new site',
				image: (
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 310 230">
						<rect x="15" y="15" fill="#E8F0F5" width="280" height="70" />
						<rect x="15" y="98" fill="#C3EF96" width="194" height="85" />
						<rect x="15" y="195" fill="#C3EF96" width="194" height="35" />
					</svg>
				)
			},
			{
				type: 'domain',
				label: 'Just buy a domain',
				image: (
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 310 230">
						<rect fill="#E8F0F5" width="310" height="110" />
						<rect x="114" y="205" fill="#E8F0F5" width="82" height="25" />
						<rect x="15" y="205" fill="#E8F0F5" width="82" height="25" />
						<rect x="213" y="205" fill="#E8F0F5" width="82" height="25" />
						<rect x="15" y="36" fill="#D2DEE6" width="153" height="13" />
						<rect x="15" y="59" fill="#D2DEE6" width="113" height="13" />
						<rect x="15" y="82" fill="#C3EF96" width="30" height="13" />
						<rect x="15" y="125" fill="#C3EF96" width="280" height="65" />
					</svg>
				)
			},
		];
	}

	renderChoices() {
		return (
			<div className="site-or-domain__choices">
				{ this.getChoices().map( ( choice ) => (
					<Card className="site-or-domain__choice" key={ choice.type }>
						<a href="#" onClick={ ( event ) => this.handleClickChoice( event, choice.type ) }>
							{ choice.image }
							<h2 className="site-or-domain__label">{ choice.label }</h2>
						</a>
					</Card>
				) ) }
			</div>
		);
	}

	handleClickChoice( event, designType ) {
		event.preventDefault();

		const { stepName, goToNextStep } = this.props;

		SignupActions.submitSignupStep( { stepName }, [], { designType } );

		if ( designType === 'domain' ) {
			SignupActions.submitSignupStep( { stepName: 'themes' } );
			SignupActions.submitSignupStep( { stepName: 'plans' } );
			goToNextStep();
		} else {
			goToNextStep();
		}
	}

	render() {
		return (
			<StepWrapper
				flowName={ this.props.flowName }
				stepName={ this.props.stepName }
				positionInFlow={ this.props.positionInFlow }
				fallbackHeaderText={ this.props.headerText }
				fallbackSubHeaderText={ this.props.subHeaderText }
				signupProgressStore={ this.props.signupProgressStore }
				stepContent={ this.renderChoices() } />
		);
	}
}
