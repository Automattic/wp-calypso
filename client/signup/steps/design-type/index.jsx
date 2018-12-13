/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { identity, memoize, transform } from 'lodash';

/**
 * Internal dependencies
 */
import StepWrapper from 'signup/step-wrapper';
import SignupActions from 'lib/signup/actions';
import Tile from 'components/tile-grid/tile';
import TileGrid from 'components/tile-grid';
import { setDesignType } from 'state/signup/steps/design-type/actions';
import { recordTracksEvent } from 'state/analytics/actions';

import { getThemeForDesignType } from 'signup/utils';

/**
 * Style dependencies
 */
import './style.scss';

export class DesignTypeStep extends Component {
	static propTypes = {
		translate: PropTypes.func,
	};

	static defaultProps = {
		translate: identity,
	};

	getChoiceHandlers = memoize( () =>
		transform(
			this.getChoices(),
			( handlers, choice ) => {
				handlers[ choice.type ] = event => this.handleChoiceClick( event, choice.type );
			},
			{}
		)
	);

	getChoices() {
		const { translate } = this.props;

		return [
			{
				type: 'blog',
				label: translate( 'Start with a blog' ),
				description: translate(
					'To share your ideas, stories, and photographs with your followers.'
				),
				image: '/calypso/images/illustrations/type-blog.svg',
			},
			{
				type: 'page',
				label: translate( 'Start with a website' ),
				description: translate(
					'To promote your business, organization, or brand and connect with your audience.'
				),
				image: '/calypso/images/illustrations/type-website.svg',
			},
			{
				type: 'grid',
				label: translate( 'Start with a portfolio' ),
				description: translate( 'To present your creative projects in a visual showcase.' ),
				image: '/calypso/images/illustrations/type-portfolio.svg',
			},
		];
	}

	renderChoice = choice => {
		const choiceHandlers = this.getChoiceHandlers();

		return (
			<Tile
				buttonLabel={ choice.label }
				description={ choice.description }
				image={ choice.image }
				key={ choice.type }
				onClick={ choiceHandlers[ choice.type ] }
			/>
		);
	};

	renderChoices() {
		return (
			<Fragment>
				<TileGrid className="design-type__list">
					{ this.getChoices().map( this.renderChoice ) }
				</TileGrid>

				<p className="design-type__disclaimer">
					{ this.props.translate(
						'Not sure? Pick the closest option. You can always change your settings later.'
					) }
				</p>
			</Fragment>
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
					fallbackSubHeaderText={ translate(
						'This will help us figure out what kinds of designs to show you.'
					) }
					headerText={ translate( "Hello! Let's create your new site." ) }
					subHeaderText={ translate( 'What kind of site do you need? Choose an option below:' ) }
					signupProgress={ this.props.signupProgress }
					stepContent={ this.renderChoices() }
				/>
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

		SignupActions.submitSignupStep( { stepName: this.props.stepName }, [], {
			designType,
			themeSlugWithRepo,
		} );
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
