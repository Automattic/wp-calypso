/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import StepWrapper from 'signup/step-wrapper';
import SignupActions from 'lib/signup/actions';
import { hints } from 'lib/signup/hint-data';
import { isUserLoggedIn } from 'state/current-user/selectors';

//Form components
import Card from 'components/card';
import Button from 'components/button';
import FormTextInput from 'components/forms/form-text-input';
import FormFieldset from 'components/forms/form-fieldset';
import Suggestions from 'components/suggestions';

class BusinessType extends Component {
	constructor( props ) {
		super( props );
		this.state = {
			query: '',
			siteTopicValue: get( this.props, 'signupProgress[1].providedDependencies.businessType', '' ),
		};
	}

	setSuggestionsRef = ref => {
		this.suggestionsRef = ref;
	};

	hideSuggestions = () => {
		this.setState( { query: '' } );
	};

	handleSuggestionChangeEvent = ( { target: { value } } ) => {
		this.setState( { query: value, siteTopicValue: value } );
	};

	handleSuggestionKeyDown = event => {
		if ( this.suggestionsRef.props.suggestions.length > 0 ) {
			const fieldName = event.target.name;
			let suggestionPosition = this.suggestionsRef.state.suggestionPosition;

			switch ( event.key ) {
				case 'ArrowRight':
					this.updateFieldFromSuggestion(
						this.getSuggestionLabel( suggestionPosition ),
						fieldName
					);

					break;
				case 'ArrowUp':
					if ( suggestionPosition === 0 ) {
						suggestionPosition = this.suggestionsRef.props.suggestions.length;
					}

					this.updateFieldFromSuggestion(
						this.getSuggestionLabel( suggestionPosition - 1 ),
						fieldName
					);

					break;
				case 'ArrowDown':
					suggestionPosition++;

					if ( suggestionPosition === this.suggestionsRef.props.suggestions.length ) {
						suggestionPosition = 0;
					}

					this.updateFieldFromSuggestion(
						this.getSuggestionLabel( suggestionPosition ),
						fieldName
					);

					break;
				case 'Tab':
					this.updateFieldFromSuggestion(
						this.getSuggestionLabel( suggestionPosition ),
						fieldName
					);

					break;
				case 'Enter':
					event.preventDefault();
					break;
			}
		}

		this.suggestionsRef.handleKeyEvent( event );
	};

	handleSuggestionMouseDown = position => {
		this.setState( { siteTopicValue: position.label } );
		this.hideSuggestions();
	};

	getSuggestions() {
		if ( ! this.state.query ) {
			return [];
		}

		const query = this.state.query.trim().toLocaleLowerCase();
		return Object.values( hints )
			.filter( hint => hint.toLocaleLowerCase().includes( query ) )
			.map( hint => ( { label: hint } ) );
	}

	getSuggestionLabel( suggestionPosition ) {
		return this.suggestionsRef.props.suggestions[ suggestionPosition ].label;
	}

	updateFieldFromSuggestion( term ) {
		this.setState( { siteTopicValue: term } );
	}

	handleChangeEvent = event => {
		this.setState( { siteTopicValue: event.target.value } );
	};

	handleSubmit = event => {
		event.preventDefault();
		const { goToNextStep, stepName, flowName, translate } = this.props;

		//Create site
		SignupActions.submitSignupStep(
			{
				processingMessage: translate( 'Collecting your information' ),
				stepName: stepName,
			},
			[],
			{
				businessType: this.state.siteTopicValue,
			}
		);

		goToNextStep( flowName );
	};

	renderContent() {
		const { translate } = this.props;

		return (
			<div className="business-type__wrapper">
				<div className="business-type__form-wrapper ">
					<form onSubmit={ this.handleSubmit }>
						<Card>
							<h3>{ translate( 'Search for your type of business' ) }</h3>
							{ translate( "Don't stress, you can change this later." ) }

							<FormFieldset>
								<FormTextInput
									id="siteTopic"
									name="siteTopic"
									placeholder={ translate( 'e.g. Fashion, travel, design, plumber, electrician' ) }
									value={ this.state.siteTopicValue }
									onChange={ this.handleSuggestionChangeEvent }
									onBlur={ this.hideSuggestions }
									onKeyDown={ this.handleSuggestionKeyDown }
									autoComplete="off"
								/>
								<Suggestions
									ref={ this.setSuggestionsRef }
									query={ this.state.query }
									suggestions={ this.getSuggestions() }
									suggest={ this.handleSuggestionMouseDown }
								/>
							</FormFieldset>

							<div className="business-type__submit-wrapper">
								<Button primary={ true } type="submit">
									{ translate( 'Continue' ) }
								</Button>
							</div>
						</Card>
					</form>
				</div>
			</div>
		);
	}

	render() {
		const { flowName, positionInFlow, signupProgress, stepName, translate } = this.props;

		return (
			<StepWrapper
				flowName={ flowName }
				stepName={ stepName }
				positionInFlow={ positionInFlow }
				headerText={ translate( 'What kind of business do you have?' ) }
				subHeaderText={ translate(
					"We'll use your answer to choose images and pages for your new website."
				) }
				signupProgress={ signupProgress }
				stepContent={ this.renderContent() }
			/>
		);
	}
}

export default connect(
	state => ( {
		isLoggedIn: isUserLoggedIn( state ),
	} ),
	{}
)( localize( BusinessType ) );
