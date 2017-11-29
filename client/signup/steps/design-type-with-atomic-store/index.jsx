/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';
import { includes, invoke } from 'lodash';

/**
 * Internal dependencies
 */
import config from 'config';
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
import { DESIGN_TYPE_STORE } from 'signup/constants';
import PressableStoreStep from '../design-type-with-store/pressable-store';
import QueryGeo from 'components/data/query-geo';
import { getGeoCountryShort } from 'state/geo/selectors';
import { getCurrentUserCountryCode } from 'state/current-user/selectors';
import { getThemeForDesignType } from 'signup/utils';

class DesignTypeWithAtomicStoreStep extends Component {
	state = {
		showStore: false,
		pendingStoreClick: false,
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
		if ( designType === DESIGN_TYPE_STORE && ! this.props.countryCode ) {
			// if we don't know the country code, we can't proceed. Continue after the code arrives
			this.setState( { pendingStoreClick: true } );
			return;
		}

		this.setState( { pendingStoreClick: false } );

		const themeSlugWithRepo = getThemeForDesignType( designType );

		this.props.setDesignType( designType );

		this.props.recordTracksEvent( 'calypso_triforce_select_design', { category: designType } );

		const isCountryAllowed =
			includes( [ 'US', 'CA' ], this.props.countryCode ) || config( 'env' ) === 'development';

		if (
			designType === DESIGN_TYPE_STORE &&
			( abtest( 'signupAtomicStoreVsPressable' ) === 'pressable' || ! isCountryAllowed )
		) {
			this.scrollUp();

			this.setState( {
				showStore: true,
			} );

			invoke( this, 'pressableStore.focus' );

			return;
		}

		SignupActions.submitSignupStep( { stepName: this.props.stepName }, [], {
			designType,
			themeSlugWithRepo,
		} );

		// If the user chooses `store` as design type, redirect to the `store-nux` flow.
		// For other choices, continue with the current flow.
		const nextFlowName = designType === DESIGN_TYPE_STORE ? 'store-nux' : this.props.flowName;
		this.props.goToNextStep( nextFlowName );
	};

	renderChoice = choice => {
		const buttonClassName = classNames( 'button design-type-with-atomic-store__cta is-compact', {
			'is-busy': choice.type === DESIGN_TYPE_STORE && this.state.pendingStoreClick,
		} );

		return (
			<Card className="design-type-with-atomic-store__choice" key={ choice.type }>
				<a
					className="design-type-with-atomic-store__choice-link"
					href="#"
					onClick={ this.handleChoiceClick( choice.type ) }
				>
					<div className="design-type-with-atomic-store__image">{ choice.image }</div>
					<div className="design-type-with-atomic-store__choice-copy">
						<span className={ buttonClassName }>{ choice.label }</span>
						<p className="design-type-with-atomic-store__choice-description">
							{ choice.description }
						</p>
					</div>
				</a>
			</Card>
		);
	};

	renderChoices() {
		const { countryCode, translate } = this.props;
		const disclaimerText = translate(
			'Not sure? Pick the closest option. You can always change your settings later.'
		); // eslint-disable-line max-len

		const storeWrapperClassName = classNames( 'design-type-with-store__store-wrapper', {
			'is-hidden': ! this.state.showStore,
		} );

		const designTypeListClassName = classNames( 'design-type-with-atomic-store__list', {
			'is-hidden': this.state.showStore,
		} );

		return (
			<div className="design-type-with-atomic-store__substep-wrapper">
				{ this.state.pendingStoreClick && ! countryCode && <QueryGeo /> }
				<div className={ storeWrapperClassName }>
					<PressableStoreStep
						{ ...this.props }
						onBackClick={ this.handleStoreBackClick }
						setRef={ this.setPressableStore }
					/>
				</div>
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

		return translate( 'Hello! Let’s create your new site.' );
	}

	getSubHeaderText() {
		const { translate } = this.props;

		return translate( 'What kind of site do you need? Choose an option below:' );
	}

	componentDidUpdate( prevProps ) {
		// If geoip data arrived, check if there is a pending click on a "store" choice and
		// process it -- all data are available now to proceed.
		if ( this.state.pendingStoreClick && ! prevProps.countryCode && this.props.countryCode ) {
			this.handleNextStep( DESIGN_TYPE_STORE );
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
	state => ( {
		countryCode: getCurrentUserCountryCode( state ) || getGeoCountryShort( state ),
	} ),
	{
		recordTracksEvent,
		setDesignType,
	}
)( localize( DesignTypeWithAtomicStoreStep ) );
