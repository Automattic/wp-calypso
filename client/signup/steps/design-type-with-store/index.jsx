/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';
import { invoke } from 'lodash';

/**
 * Internal dependencies
 */
import StepWrapper from 'signup/step-wrapper';
import SignupActions from 'lib/signup/actions';
import Card from 'components/card';
import { abtest } from 'lib/abtest';
import { localize } from 'i18n-calypso';
import { recordTracksEvent } from 'state/analytics/actions';
import PressableStoreStep from './pressable-store';
import BlogImage from './blog-image';
import PageImage from './page-image';
import GridImage from './grid-image';
import StoreImage from './store-image';

class DesignTypeWithStoreStep extends Component {
	constructor( props ) {
		super( props );

		this.state = {
			showStore: false
		};

		this.setPressableStore = this.setPressableStore.bind( this );
	}

	getChoices() {
		const { translate } = this.props;

		if ( abtest( 'signupStepOneCopyChanges' ) === 'modified' ) {
			// Note: Don't make this translatable because it's only visible to English-language users
			return [
				{ type: 'blog',
					label: 'A blog',
					description: 'To share your ideas, stories, and photographs with your followers.',
					image: <BlogImage /> },
				{ type: 'page',
					label: 'A website',
					description: 'To promote your business, organization, or brand and connect with your audience.',
					image: <PageImage /> },
				{ type: 'grid',
					label: 'A portfolio',
					description: 'To present your creative projects in a visual showcase.',
					image: <GridImage /> },
				{ type: 'store',
					label: 'An online store',
					description: 'To sell your products or services and accept payments.',
					image: <StoreImage /> },
			];
		}

		return [
			{ type: 'blog', label: translate( 'A list of my latest posts' ), image: <BlogImage /> },
			{ type: 'page', label: translate( 'A welcome page for my site' ), image: <PageImage /> },
			{ type: 'grid', label: translate( 'A grid of my latest posts' ), image: <GridImage /> },
			{ type: 'store', label: translate( 'An online store' ), image: <StoreImage /> },
		];
	}

	scrollUp() {
		// Didn't use setInterval in order to fix delayed scroll
		while ( window.pageYOffset > 0 ) {
			window.scrollBy( 0, -10 );
		}
	}

	handleStoreBackClick = () => {
		this.setState(
			{ showStore: false },
			this.scrollUp
		);
	};

	handleChoiceClick = type => event => {
		event.preventDefault();
		event.stopPropagation();
		this.handleNextStep( type );
	};

	handleNextStep = ( designType ) => {
		this.props.recordNextStep( designType );

		if ( designType === 'store' ) {
			this.scrollUp();

			this.setState( {
				showStore: true
			} );

			invoke( this, 'pressableStore.focus' );

			return;
		}

		SignupActions.submitSignupStep( { stepName: this.props.stepName }, [], { designType } );
		this.props.goToNextStep();
	};

	renderChoice = ( choice ) => {
		let choiceCardClass = 'design-type-with-store__choice';
		let choiceLabel = <h2 className="design-type-with-store__choice-label">{ choice.label }</h2>;
		let choiceDescription = null;
		let callToAction = null;

		if ( abtest( 'signupStepOneCopyChanges' ) === 'modified' ) {
			choiceLabel = null;
			choiceCardClass += ' design-type-with-store__choice--test';
			choiceDescription = <p className="design-type-with-store__choice-description">{ choice.description }</p>;
			callToAction = <span className="button is-compact design-type-with-store__cta">Start with {choice.label}</span>;
		}

		if ( abtest( 'signupStepOneMobileOptimize' ) === 'modified' ) {
			choiceCardClass += ' design-type-with-store__choice--mobile-test';
		}

		return (
			<Card className={ choiceCardClass } key={ choice.type }>
				<a className="design-type-with-store__choice-link"
					href="#"
					onClick={ this.handleChoiceClick( choice.type ) }>
					{ choice.image }
					<div className="design-type-with-store__choice-copy">
						{ choiceLabel }
						{ callToAction }
						{ choiceDescription }
					</div>
				</a>
			</Card>
		);
	};

	renderChoices() {
		let disclaimer = null;

		const storeWrapperClassName = classNames(
			'design-type-with-store__store-wrapper',
			{ 'is-hidden': ! this.state.showStore }
		);

		const designTypeListClassName = classNames(
			'design-type-with-store__list',
			{ 'is-hidden': this.state.showStore }
		);

		if ( abtest( 'signupStepOneCopyChanges' ) === 'modified' ) {
			// Note: Don't make this translatable because it's only visible to English-language users
			disclaimer = <p className="design-type-with-store__disclaimer">
								Not sure? Pick the closest option. You can always change your settings later.
							</p>;
		}

		return (
			<div className="design-type-with-store__substep-wrapper">
				<div className={ storeWrapperClassName }>
					<PressableStoreStep
						{ ... this.props }
						onBackClick={ this.handleStoreBackClick }
						setRef={ this.setPressableStore }
					/>
				</div>
				<div className={ designTypeListClassName }>
					{ this.getChoices().map( this.renderChoice ) }
					{ disclaimer }
				</div>
			</div>
		);
	}

	setPressableStore( ref ) {
		this.pressableStore = ref;
	}

	getHeaderText() {
		const { translate } = this.props;

		if ( this.state.showStore ) {
			return translate( 'Create your WordPress Store' );
		}

		if ( abtest( 'signupStepOneCopyChanges' ) === 'modified' ) {
			// Note: Don't make this translatable because it's only visible to English-language users
			return 'Hello! Let’s create your new site.';
		}

		return translate( 'Let\'s get started.' );
	}

	getSubHeaderText() {
		const { translate } = this.props;

		if ( this.state.showStore ) {
			return translate( 'Our partners at Pressable and WooCommerce are here for you.' );
		}

		if ( abtest( 'signupStepOneCopyChanges' ) === 'modified' ) {
			// Note: Don't make this translatable because it's only visible to English-language users
			return 'What kind of site do you need? Choose an option below:';
		}

		return translate( 'This will help us figure out what kinds of designs to show you.' );
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
				shouldHideNavButtons={ this.state.showStore } />
		);
	}
}

const mapDispatchToProps = dispatch => ( {
	recordNextStep: designType => dispatch( recordTracksEvent( 'calypso_triforce_select_design', { category: designType } ) )
} );

export default connect( null, mapDispatchToProps )( localize( DesignTypeWithStoreStep ) );
