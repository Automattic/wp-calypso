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
		const blogText = translate(
			'To share your ideas, stories, and photographs with your followers.'
		);
		const siteText = translate(
			'To promote your business, organization, or brand and connect with your audience.'
		);
		const gridText = translate( 'To present your creative projects in a visual showcase.' );
		const storeText = translate( 'To sell your products or services and accept payments.' );

		return [
			{ type: 'blog',
				label: translate( 'Start with a blog' ),
				description: blogText,
				image: <BlogImage /> },
			{ type: 'page',
				label: translate( 'Start with a website' ),
				description: siteText,
				image: <PageImage /> },
			{ type: 'grid',
				label: translate( 'Start with a portfolio' ),
				description: gridText,
				image: <GridImage /> },
			{ type: 'store',
				label: translate( 'Start with an online store' ),
				description: storeText,
				image: <StoreImage /> },
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
		return (
			<Card className="design-type-with-store__choice" key={ choice.type }>
				<a className="design-type-with-store__choice-link"
					href="#"
					onClick={ this.handleChoiceClick( choice.type ) }>
					<div className="design-type-with-store__image">
						{ choice.image }
					</div>
					<div className="design-type-with-store__choice-copy">
						<span className="button is-compact design-type-with-store__cta">
							{choice.label}
						</span>
						<p className="design-type-with-store__choice-description">
							{ choice.description }
						</p>
					</div>
				</a>
			</Card>
		);
	};

	renderChoices() {
		const { translate } = this.props;
		const disclaimerText = translate( 'Not sure? Pick the closest option. You can always change your settings later.' ); // eslint-disable-line max-len

		const storeWrapperClassName = classNames(
			'design-type-with-store__store-wrapper',
			{ 'is-hidden': ! this.state.showStore }
		);

		const designTypeListClassName = classNames(
			'design-type-with-store__list',
			{ 'is-hidden': this.state.showStore }
		);

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

					<p className="design-type-with-store__disclaimer">
						{ disclaimerText }
					</p>
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

		return translate( 'Hello! Let’s create your new site.' );
	}

	getSubHeaderText() {
		const { translate } = this.props;

		if ( this.state.showStore ) {
			return translate( 'Our partners at Pressable and WooCommerce are here for you.' );
		}

		return translate( 'What kind of site do you need? Choose an option below:' );
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
	recordNextStep: designType => dispatch( recordTracksEvent( 'calypso_triforce_select_design',
		{ category: designType } ) )
} );

export default connect( null, mapDispatchToProps )( localize( DesignTypeWithStoreStep ) );
