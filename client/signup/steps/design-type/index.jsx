/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import { identity, memoize, transform } from 'lodash';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { BlogImage, PageImage, GridImage } from '../design-type-with-store/type-images';
import Card from 'components/card';
import SignupActions from 'lib/signup/actions';
import StepWrapper from 'signup/step-wrapper';
import { getThemeForDesignType } from 'signup/utils';
import { recordTracksEvent } from 'state/analytics/actions';
import { setDesignType } from 'state/signup/steps/design-type/actions';

export class DesignTypeStep extends Component {
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

		return [
			{
				type: 'blog',
				label: translate( 'Start with a blog' ),
				description: translate( 'To share your ideas, stories, and photographs with your followers.' ),
				image: <BlogImage />,
			},
			{
				type: 'page',
				label: translate( 'Start with a website' ),
				description: translate( 'To promote your business, organization, or brand and connect with your audience.' ),
				image: <PageImage />,
			},
			{
				type: 'grid',
				label: translate( 'Start with a portfolio' ),
				description: translate( 'To present your creative projects in a visual showcase.' ),
				image: <GridImage />,
			},
		];
	}

	renderChoice = ( choice ) => {
		const choiceHandlers = this.getChoiceHandlers();

		return (
			<Card
				key={ choice.type }
				href={ `#${ choice.type }` }
				className="design-type__choice"
				onClick={ choiceHandlers[ choice.type ] }
			>
				<div className="design-type__choice-image">
					{ choice.image }
				</div>
				<div className="design-type__choice-copy">
					<span className="button is-compact design-type__cta">{ choice.label }</span>
					<p className="design-type__choice-description">{ choice.description }</p>
				</div>
			</Card>
		);
	}

	renderChoices() {
		return (
			<div className="design-type__list">
				{ this.getChoices().map( this.renderChoice ) }
				<div className="design-type__choice is-spacergif" />
				<p className="design-type__disclaimer">
					{ this.props.translate( 'Not sure? Pick the closest option. You can always change your settings later.' ) }
				</p>
			</div>
		);
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
					headerText={ translate( 'Hello! Let\'s create your new site.' ) }
					subHeaderText={ translate( 'What kind of site do you need? Choose an option below:' ) }
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
		const themeSlugWithRepo = getThemeForDesignType( designType );

		this.props.setDesignType( designType );

		this.props.recordTracksEvent( 'calypso_triforce_select_design', { category: designType } );

		SignupActions.submitSignupStep( { stepName: this.props.stepName }, [], { designType, themeSlugWithRepo } );
		this.props.goToNextStep();
	}
}

export default connect(
	null,
	{
		recordTracksEvent,
		setDesignType,
	}
)( localize( DesignTypeStep ) );
