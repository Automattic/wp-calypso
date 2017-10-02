/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import StepWrapper from 'signup/step-wrapper';
import Card from 'components/card';
import { localize } from 'i18n-calypso';
import { recordTracksEvent } from 'state/analytics/actions';
import {
	BlogImage,
	PageImage,
	GridImage,
	StoreImage,
} from '../design-type-with-atomic-store/type-images';
import { abtest } from 'lib/abtest';
import SignupActions from 'lib/signup/actions';

import { setDesignType } from 'state/signup/steps/design-type/actions';

import SignupDependencyStore from 'lib/signup/dependency-store';
import SignupProgressStore from 'lib/signup/progress-store';
import { getSignupDependencyStore } from 'state/signup/dependency-store/selectors';

class DesignTypeWithAtomicStoreStep extends Component {
	constructor( props ) {
		super( props );

		this.state = {
			showStore: false,
		};
	}

	getChoices() {
		const { translate } = this.props;
		const blogText = translate(
			'To share your ideas, stories, and photographs with your followers.'
		);
		const siteText = translate(
			'To promote your business, organization, or brand and connect with your audience.'
		);
		const gridText = translate( 'To present your creative projects in a visual showcase.' );
		const storeText = translate( 'To sell your products or services and accept payments.' );

		return [
			{
				type: 'blog',
				label: translate( 'Start with a blog' ),
				description: blogText,
				image: <BlogImage />,
			},
			{
				type: 'page',
				label: translate( 'Start with a website' ),
				description: siteText,
				image: <PageImage />,
			},
			{
				type: 'grid',
				label: translate( 'Start with a portfolio' ),
				description: gridText,
				image: <GridImage />,
			},
			{
				type: 'store',
				label: translate( 'Start with an online store' ),
				description: storeText,
				image: <StoreImage />,
			},
		];
	}

	handleChoiceClick = type => event => {
		event.preventDefault();
		event.stopPropagation();
		this.handleNextStep( type );
	};

	handleNextStep = designType => {
		this.props.setDesignType( designType );

		this.props.recordTracksEvent( 'calypso_triforce_select_design', { category: designType } );

		SignupActions.submitSignupStep( { stepName: this.props.stepName }, [], {
			designType,
		} );

		this.props.goToNextStep();
	};

	renderChoice = choice => {
		return (
			<Card className="design-type-with-atomic-store__choice" key={ choice.type }>
				<a
					className="design-type-with-atomic-store__choice-link"
					href="#"
					onClick={ this.handleChoiceClick( choice.type ) }
				>
					<div className="design-type-with-atomic-store__image">{ choice.image }</div>
					<div className="design-type-with-atomic-store__choice-copy">
						<span className="button is-compact design-type-with-atomic-store__cta">
							{ choice.label }
						</span>
						<p className="design-type-with-atomic-store__choice-description">
							{ choice.description }
						</p>
					</div>
				</a>
			</Card>
		);
	};

	renderChoices() {
		const { translate } = this.props;
		const disclaimerText = translate(
			'Not sure? Pick the closest option. You can always change your settings later.'
		); // eslint-disable-line max-len

		const designTypeListClassName = classNames( 'design-type-with-atomic-store__list', {
			'is-hidden': this.state.showStore,
		} );

		return (
			<div className="design-type-with-atomic-store__substep-wrapper">
				<div className={ designTypeListClassName }>
					{ this.getChoices().map( this.renderChoice ) }

					<p className="design-type-with-atomic-store__disclaimer">{ disclaimerText }</p>
				</div>
			</div>
		);
	}

	getHeaderText() {
		const { translate } = this.props;

		if ( this.state.showStore ) {
			return translate( 'Create your WordPress Store' );
		}

		if ( abtest( 'signupSurveyStep' ) === 'showSurveyStep' ) {
			return "We're excited to hear more about your project.";
		}

		return translate( 'Hello! Let’s create your new site.' );
	}

	getSubHeaderText() {
		const { translate } = this.props;

		return translate( 'What kind of site do you need? Choose an option below:' );
	}

	componentWillMount() {
		if ( this.props.signupDependencyStore.themeSlugWithRepo ) {
			SignupDependencyStore.reset();
		}

		if ( this.props.signupProgress ) {
			SignupProgressStore.reset();
		}
	}

	render() {
		const headerText = this.getHeaderText();
		const subHeaderText = this.getSubHeaderText();

		return (
			<StepWrapper
				flowName={ this.props.flowName }
				stepName={ this.props.stepName }
				positionInFlow={ this.props.positionInFlow }
				fallbackHeaderText={ headerText }
				fallbackSubHeaderText={ subHeaderText }
				headerText={ headerText }
				subHeaderText={ subHeaderText }
				signupProgress={ this.props.signupProgress }
				stepContent={ this.renderChoices() }
				shouldHideNavButtons={ this.state.showStore }
			/>
		);
	}
}

export default connect(
	state => {
		return {
			signupDependencyStore: getSignupDependencyStore( state ),
		};
	},
	{
		recordTracksEvent,
		setDesignType,
	}
)( localize( DesignTypeWithAtomicStoreStep ) );
