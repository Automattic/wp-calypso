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

		return [
			{ type: 'blog', label: translate( 'A list of my latest posts' ), image: <BlogImage /> },
			{ type: 'page', label: translate( 'A welcome page for my site' ), image: <PageImage /> },
			{ type: 'grid', label: translate( 'A grid of my latest posts' ), image: <GridImage /> },
		];
	}

	renderChoices() {
		const choiceHandlers = this.getChoiceHandlers();

		return (
			<div className="design-type__list">
				{ this.getChoices().map( ( choice ) => (
						<Card className="design-type__choice" key={ choice.type }>
							<a
								className="design-type__choice-link"
								onClick={ choiceHandlers[ choice.type ] }
							>
								{ choice.image }
								<h2>{ choice.label }</h2>
							</a>
						</Card>
					)
				) }
				<div className="design-type__choice is-spacergif" />
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
					subHeaderText={ translate( 'First up, what would you like your homepage to look like?' ) }
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
