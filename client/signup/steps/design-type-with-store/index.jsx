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
import BluehostStoreStep from './bluehost-store';
import SitegroundStoreStep from './siteground-store';
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

		return [
			{ type: 'blog', label: translate( 'A list of my latest posts' ), image: <BlogImage />  },
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
		return (
			<Card className="design-type-with-store__choice" key={ choice.type }>
				<a className="design-type-with-store__choice__link"
					href="#"
					onClick={ this.handleChoiceClick( choice.type ) }>
					{ choice.image }
					<h2>{ choice.label }</h2>
				</a>
			</Card>
		);
	};

	renderChoices() {
		return (
			<div className="design-type-with-store__list">
				{ this.getChoices().map( this.renderChoice ) }
			</div>
		);
	}

	setPressableStore( ref ) {
		this.pressableStore = ref;
	}

	renderStoreStep() {
		switch ( abtest( 'signupStoreBenchmarking' ) ) {
			case 'bluehost':
				return <BluehostStoreStep
							{ ... this.props }
							onBackClick={ this.handleStoreBackClick }
						/>;
			case 'bluehostWithWoo':
				return <BluehostStoreStep
							{ ... this.props }
							onBackClick={ this.handleStoreBackClick }
							partnerName="Bluehost with WooCommerce"
						/>;
			case 'siteground':
				return <SitegroundStoreStep
							{ ... this.props }
							onBackClick={ this.handleStoreBackClick }
						/>;
			default:
				return <PressableStoreStep
							{ ... this.props }
							onBackClick={ this.handleStoreBackClick }
							setRef={ this.setPressableStore }
						/>;
		}
	}

	render() {
		const storeWrapperClassName = classNames( {
			'design-type-with-store__store-wrapper': true,
			'is-hidden': ! this.state.showStore,
		} );

		const sectionWrapperClassName = classNames( {
			'design-type-with-store__section-wrapper': true,
			'is-hidden': this.state.showStore,
		} );

		return (
			<div className="design-type-with-store">
				<div className={ storeWrapperClassName } >
					{ this.renderStoreStep() }
				</div>
				<div className={ sectionWrapperClassName }>
					<StepWrapper
						flowName={ this.props.flowName }
						stepName={ this.props.stepName }
						positionInFlow={ this.props.positionInFlow }
						fallbackHeaderText={ this.props.translate( 'What would you like your homepage to look like?' ) }
						fallbackSubHeaderText={ this.props.translate( 'This will help us figure out what kinds of designs to show you.' ) }
						subHeaderText={ this.props.translate( 'First up, what would you like your homepage to look like?' ) }
						signupProgress={ this.props.signupProgress }
						stepContent={ this.renderChoices() } />
				</div>
			</div>
		);
	}
}

const mapDispatchToProps = dispatch => ( {
	recordNextStep: designType => dispatch( recordTracksEvent( 'calypso_triforce_select_design', { category: designType } ) )
} );

export default connect( null, mapDispatchToProps )( localize( DesignTypeWithStoreStep ) );
