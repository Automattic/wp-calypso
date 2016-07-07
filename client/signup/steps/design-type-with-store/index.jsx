/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import StepWrapper from 'signup/step-wrapper';
import SignupActions from 'lib/signup/actions';
import analytics from 'lib/analytics';
import Card from 'components/card';

import PressableStoreStep from './pressable-store';

export default React.createClass( {
	displayName: 'DesignTypeWithStoreStep',

	getInitialState() {
		return {
			showStore: false
		};
	},

	getChoices() {
		return [
			{ type: 'blog', label: this.translate( 'A list of my latest posts' ), image: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 310 230"><rect x="15" y="15" fill="#E8F0F5" width="280" height="70"/><rect x="15" y="98" fill="#C3EF96" width="194" height="85"/><rect x="15" y="195" fill="#C3EF96" width="194" height="35"/></svg> },
			{ type: 'page', label: this.translate( 'A welcome page for my site' ), image: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 310 230"><rect fill="#E8F0F5" width="310" height="110"/><rect x="114" y="205" fill="#E8F0F5" width="82" height="25"/><rect x="15" y="205" fill="#E8F0F5" width="82" height="25"/><rect x="213" y="205" fill="#E8F0F5" width="82" height="25"/><rect x="15" y="36" fill="#D2DEE6" width="153" height="13"/><rect x="15" y="59" fill="#D2DEE6" width="113" height="13"/><rect x="15" y="82" fill="#C3EF96" width="30" height="13"/><rect x="15" y="125" fill="#C3EF96" width="280" height="65"/></svg> },
			{ type: 'grid', label: this.translate( 'A grid of my latest posts' ), image: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 310 230"><rect x="15" y="15" fill="#E8F0F5" width="280" height="40"/><rect x="114" y="70" fill="#C3EF96" width="82" height="65"/><rect x="15" y="70" fill="#C3EF96" width="82" height="65"/><rect x="213" y="70" fill="#C3EF96" width="82" height="65"/><rect x="114" y="150" fill="#C3EF96" width="82" height="65"/><rect x="15" y="150" fill="#C3EF96" width="82" height="65"/><rect x="213" y="150" fill="#C3EF96" width="82" height="65"/></svg> },
			{ type: 'store', label: this.translate( 'An online store' ), image: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 307 229"><g fill="none" fill-rule="evenodd"><path fill="#C4EF96" d="M14 121h82v65H14zM14 201h82v28H14zM210 121h82v65h-82zM210 201h82v28h-82zM112 121h82v65h-82zM112 201h82v28h-82z"/><path fill="#E8F0F5" d="M0 0h307v105H0z"/><path d="M112 13h80v80h-80z"/><path d="M142 79.667c0 3.666-3 6.666-6.667 6.666-3.666 0-6.633-3-6.633-6.666C128.7 76 131.667 73 135.333 73 139 73 142 76 142 79.667zM168.667 73c-3.667 0-6.634 3-6.634 6.667 0 3.666 2.967 6.666 6.634 6.666 3.666 0 6.666-3 6.666-6.666 0-3.667-3-6.667-6.666-6.667zm1.32-16.667c3.123 0 5.83-2.17 6.506-5.22L182 29.667h-46.667v-3.334a6.665 6.665 0 0 0-6.666-6.666H122v6.666h6.667V63a6.665 6.665 0 0 0 6.666 6.667h40A6.665 6.665 0 0 0 168.667 63h-33.334v-6.667h34.654z" fill="#D2DEE6"/></g></svg> },
		];
	},

	onPressableStoreStepRef( pressableStoreStep ) {
		this._pressableStore = pressableStoreStep;
	},

	renderChoice( choice ) {
		return (
			<Card className="design-type-with-store__choice" key={ choice.type }>
				<a className="design-type-with-store__choice__link" href="#" onClick={ ( event ) => this.handleChoiceClick( event, choice.type ) }>
					{ choice.image }
					<h2>{ choice.label }</h2>
				</a>
			</Card>
		);
	},

	renderChoices() {
		return (
			<div className="design-type-with-store__list">
				{ this.getChoices().map( this.renderChoice ) }
			</div>
		);
	},

	render() {
		let pressableWrapperClassName = classNames( {
			'design-type-with-store__pressable-wrapper': true,
			'is-hidden': ! this.state.showStore,
		} );

		let sectionWrapperClassName = classNames( {
			'design-type-with-store__section-wrapper': true,
			'is-hidden': this.state.showStore,
		} );

		return (
			<div className="design-type-with-store">
				<div className={ pressableWrapperClassName } >
					<PressableStoreStep { ... this.props } ref={ this.onPressableStoreStepRef } onBackClick={ this.handlePressableStoreBackClick }/>
				</div>
				<div className={ sectionWrapperClassName }>
					<StepWrapper
						flowName={ this.props.flowName }
						stepName={ this.props.stepName }
						positionInFlow={ this.props.positionInFlow }
						fallbackHeaderText={ this.translate( 'What would you like your homepage to look like?' ) }
						fallbackSubHeaderText={ this.translate( 'This will help us figure out what kinds of designs to show you.' ) }
						signupProgressStore={ this.props.signupProgressStore }
						stepContent={ this.renderChoices() } />
				</div>
			</div>
		);
	},

	scrollUp() {
		this.windowScroller = setInterval( () => {
			if ( window.pageYOffset > 0 ) {
				window.scrollBy( 0, -10 );
			} else {
				clearInterval( this.windowScroller );
				this.windowScroller = null;
			}
		}, 1 );
	},

	handlePressableStoreBackClick() {
		this.setState( {
			showStore: false
		} );

		this.scrollUp();
	},

	handleChoiceClick( event, type ) {
		event.preventDefault();
		event.stopPropagation();
		this.handleNextStep( type );
	},

	handleNextStep( designType ) {
		analytics.tracks.recordEvent( 'calypso_triforce_select_design', { category: designType } );

		if ( designType === 'store' ) {
			this.setState( {
				showStore: true
			} );

			this.scrollUp();

			if ( this._pressableStore ) {
				this._pressableStore.focus();
			}

			return;
		}

		SignupActions.submitSignupStep( { stepName: this.props.stepName }, [], { designType } );
		this.props.goToNextStep();
	}
} );
