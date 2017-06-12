/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { identity, memoize, transform } from 'lodash';

/**
 * Internal dependencies
 */
import StepWrapper from 'signup/step-wrapper';
import SignupActions from 'lib/signup/actions';
import Card from 'components/card';

import BlogImage from '../design-type-with-store/blog-image';
import PageImage from '../design-type-with-store/page-image';
import GridImage from '../design-type-with-store/grid-image';

import { recordTracksEvent } from 'state/analytics/actions';
import { abtest } from 'lib/abtest';

class DesignTypeStep extends Component {
	static propTypes = {
		translate: PropTypes.func
	};

	static defaultProps = {
		translate: identity
	};

	getChoiceHandlers = memoize( ( ) =>
		transform( this.getChoices(), ( handlers, choice ) => {
			handlers[ choice.type ] = ( event ) => this.handleChoiceClick( event, choice.type );
		}, {} )
	);

	getChoices() {
		const { translate } = this.props;
		const modified = abtest( 'siteCreationStepOne' ) === 'modified';

		if ( modified ) {
			// Note: Don't make this translatable because it's only visible to English-language users.
			return [
				{
					type: 'blog',
					label: 'Start with a blog',
					description: 'To share your ideas, stories, and photographs with your followers.',
					image: <BlogImage />,
				},
				{
					type: 'page',
					label: 'Start with a website',
					description: 'To promote your business organization, or brand and connect with your audience.',
					image: <PageImage />,
				},
				{
					type: 'grid',
					label: 'Start with a portfolio',
					description: 'To present your creative projects in a visual showcase.',
					image: <GridImage />,
				},
			];
		}

		return [
			{ type: 'blog', label: translate( 'A list of my latest posts' ), image: <BlogImage /> },
			{ type: 'page', label: translate( 'A welcome page for my site' ), image: <PageImage /> },
			{ type: 'grid', label: translate( 'A grid of my latest posts' ), image: <GridImage /> },
		];
	}

	renderChoice = ( choice ) => {
		const modified = abtest( 'siteCreationStepOne' ) === 'modified';
		const choiceHandlers = this.getChoiceHandlers();

		let choiceLabel = <h2>{ choice.label }</h2>;
		let choiceCardClass = 'design-type__choice';
		let choiceDescription = null;
		let callToAction = null;

		if ( modified ) {
			choiceLabel = null;
			choiceCardClass += ' design-type__choice--test';
			choiceDescription = <p className="design-type__choice-description">{ choice.description }</p>;
			callToAction = <span className="button is-compact design-type__cta">{ choice.label }</span>;
		}

		return (
			<Card className={ choiceCardClass } key={ choice.type } href="#{choice.type}" onClick={ choiceHandlers[ choice.type ] }>
				<div className="design-type__choice-image">
					{ choice.image }
				</div>
				<div className="design-type__choice-copy">
					{ choiceLabel }
					{ callToAction }
					{ choiceDescription }
				</div>
			</Card>
		);
	}

	renderChoices() {
		return (
			<div className="design-type__list">
				{ this.getChoices().map( this.renderChoice ) }
				<div className="design-type__choice is-spacergif" />
				{ this.getDisclaimer() }
			</div>
		);
	}

	getDisclaimer() {
		const modified = abtest( 'siteCreationStepOne' ) === 'modified';

		if ( modified ) {
			// Note: Don't make this translatable because it's only visible to English-language users.
			return (
				<p className="design-type__disclaimer">
					Not sure? Pick the closest option. You can always change your settings later.
				</p>
			);
		}

		return null;
	}

	getHeadertext() {
		const { translate } = this.props;
		const modified = abtest( 'siteCreationStepOne' ) === 'modified';

		if ( modified ) {
			// Note: Don't make this translatable because it's only visible to English-language users
			return 'Hello! Let\'s create your new site.';
		}

		return translate( 'Let\'s get started.' );
	}

	getSubHeaderText() {
		const { translate } = this.props;
		const modified = abtest( 'siteCreationStepOne' ) === 'modified';

		if ( modified ) {
			// Note: Don't make this translatable because it's only visible to English-language users
			return 'What kind of site do you need? Choose an option below:';
		}

		return translate( 'First up, what would you like your homepage to look like?' );
	}

	render() {
		const { translate } = this.props;

		return (
			<div className="design-type">
				<StepWrapper
					flowName={ this.props.flowName }
					stepName={ this.props.stepName }
					positionInFlow={ this.props.positionInFlow }
					fallbackHeaderText={ translate( 'What would you like your homepage to look like?' ) }
					fallbackSubHeaderText={ translate( 'This will help us figure out what kinds of designs to show you.' ) }
					headerText={ this.getHeadertext() }
					subHeaderText={ this.getSubHeaderText() }
					signupProgress={ this.props.signupProgress }
					stepContent={ this.renderChoices() } />
			</div>
		);
	}

	handleChoiceClick( event, type ) {
		event.preventDefault();
		event.stopPropagation();
		this.handleNextStep( type );
	}

	handleNextStep( designType ) {
		this.props.recordTracksEvent( 'calypso_triforce_select_design', { category: designType } );

		SignupActions.submitSignupStep( { stepName: this.props.stepName }, [], { designType } );
		this.props.goToNextStep();
	}
}

export default connect(
	null,
	{
		recordTracksEvent
	}
)( localize( DesignTypeStep ) );
