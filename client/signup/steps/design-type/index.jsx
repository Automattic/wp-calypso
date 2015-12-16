/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import StepWrapper from 'signup/step-wrapper';
import SignupActions from 'lib/signup/actions';
import analytics from 'analytics';
import getThemes from './themes-map';
import Card from 'components/card';

export default React.createClass( {
	displayName: 'DesignType',

	getChoices() {
		return [
			{ type: 'blog', label: this.translate( 'A list of my latest posts' ), image: '/calypso/images/signup/design-type/design-type-latest.svg' },
			{ type: 'page', label: this.translate( 'A welcome page for my site' ), image: '/calypso/images/signup/design-type/design-type-welcome.svg' },
			{ type: 'grid', label: this.translate( 'A grid of my latest posts' ), image: '/calypso/images/signup/design-type/design-type-grid.svg' },
		];
	},

	renderChoice( choice ) {
		return (
			<Card className="design-type__choice" key={ choice.type }>
				<a className="design-type__choice__link" href="#" onClick={ ( event ) => this.handleChoiceClick( event, choice.type ) }>
					<img src={ choice.image } />
					<h2>{ choice.label }</h2>
				</a>
			</Card>
		);
	},

	renderChoices() {
		return (
			<div className="design-type__list">
				{ this.getChoices().map( this.renderChoice ) }
				<div className="design-type__choice is-spacergif" />
			</div>
		);
	},

	render() {
		return (
			<div className="design-type__section-wrapper">
				<StepWrapper
					flowName={ this.props.flowName }
					stepName={ this.props.stepName }
					positionInFlow={ this.props.positionInFlow }
					headerText={ this.translate( 'What would you like your homepage to look like?' ) }
					subHeaderText={ this.translate( 'This will help us figure out what kinds of designs to show you.' ) }
					signupProgressStore={ this.props.signupProgressStore }
					stepContent={ this.renderChoices() } />
			</div>
		);
	},

	handleChoiceClick( event, type ) {
		event.preventDefault();
		event.stopPropagation();
		this.handleNextStep( type );
	},

	handleNextStep( designType ) {
		const themes = getThemes( designType );

		analytics.tracks.recordEvent( 'calypso_triforce_select_design', { category: designType } );

		SignupActions.submitSignupStep( { stepName: this.props.stepName }, [], { themes } );
		this.props.goToNextStep();
	}
} );
