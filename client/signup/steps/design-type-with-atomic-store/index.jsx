/** @format */
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
import Tile from 'components/tile-grid/tile';
import TileGrid from 'components/tile-grid';
import { localize } from 'i18n-calypso';
import { recordTracksEvent } from 'state/analytics/actions';
import { abtest } from 'lib/abtest';
import SignupActions from 'lib/signup/actions';
import { setDesignType } from 'state/signup/steps/design-type/actions';
import { DESIGN_TYPE_STORE } from 'signup/constants';
import PressableStoreStep from '../design-type-with-store/pressable-store';
import { getThemeForDesignType } from 'signup/utils';

class DesignTypeWithAtomicStoreStep extends Component {
	state = {
		showStore: false,
	};
	setPressableStore = ref => ( this.pressableStore = ref );

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
				image: '/calypso/images/illustrations/type-blog.svg',
			},
			{
				type: 'page',
				label: translate( 'Start with a website' ),
				description: siteText,
				image: '/calypso/images/illustrations/type-website.svg',
			},
			{
				type: 'grid',
				label: translate( 'Start with a portfolio' ),
				description: gridText,
				image: '/calypso/images/illustrations/type-portfolio.svg',
			},
			{
				type: 'store',
				label: translate( 'Start with an online store' ),
				description: storeText,
				image: '/calypso/images/illustrations/type-e-commerce.svg',
			},
		];
	}

	scrollUp() {
		// Didn't use setInterval in order to fix delayed scroll
		while ( window.pageYOffset > 0 ) {
			window.scrollBy( 0, -10 );
		}
	}

	handleStoreBackClick = () => {
		this.setState( { showStore: false }, this.scrollUp );
	};

	handleChoiceClick = type => event => {
		event.preventDefault();
		event.stopPropagation();
		this.handleNextStep( type );
	};

	handleNextStep = designType => {
		const themeSlugWithRepo = getThemeForDesignType( designType );

		this.props.setDesignType( designType );

		this.props.recordTracksEvent( 'calypso_triforce_select_design', { category: designType } );

		if (
			designType === DESIGN_TYPE_STORE &&
			abtest( 'signupAtomicStoreVsPressable' ) === 'pressable'
		) {
			this.scrollUp();

			this.setState( {
				showStore: true,
			} );

			invoke( this, 'pressableStore.focus' );

			return;
		}

		SignupActions.submitSignupStep(
			{ stepName: this.props.stepName },
			{
				designType,
				themeSlugWithRepo,
			}
		);

		// If the user chooses `store` as design type, redirect to the `store-nux` flow.
		// For other choices, continue with the current flow.
		const nextFlowName = designType === DESIGN_TYPE_STORE ? 'store-nux' : this.props.flowName;
		this.props.goToNextStep( nextFlowName );
	};

	renderChoice = choice => {
		return (
			<Tile
				buttonLabel={ choice.label }
				description={ choice.description }
				image={ choice.image }
				key={ choice.type }
				onClick={ this.handleChoiceClick( choice.type ) }
			/>
		);
	};

	renderChoices() {
		const { translate } = this.props;
		const disclaimerText = translate(
			'Not sure? Pick the closest option. You can always change your settings later.'
		);

		const storeWrapperClassName = classNames( 'design-type-with-store__store-wrapper', {
			'is-hidden': ! this.state.showStore,
		} );

		const designTypeListClassName = classNames( 'design-type-with-store__list', {
			'is-hidden': this.state.showStore,
		} );

		return (
			<div className="design-type-with-atomic-store__substep-wrapper design-type-with-store__substep-wrapper">
				<div className={ storeWrapperClassName }>
					<PressableStoreStep
						{ ...this.props }
						onBackClick={ this.handleStoreBackClick }
						setRef={ this.setPressableStore }
						isVisible={ this.state.showStore }
					/>
				</div>
				<div className={ designTypeListClassName }>
					<TileGrid>{ this.getChoices().map( this.renderChoice ) }</TileGrid>

					<p className="design-type-with-store__disclaimer design-type-with-atomic-store__disclaimer">
						{ disclaimerText }
					</p>
				</div>
			</div>
		);
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
				shouldHideNavButtons={ this.state.showStore }
			/>
		);
	}
}

export default connect( null, {
	recordTracksEvent,
	setDesignType,
} )( localize( DesignTypeWithAtomicStoreStep ) );
