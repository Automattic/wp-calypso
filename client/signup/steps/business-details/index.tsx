/** @format */

/**
 * External dependencies
 */
import { get } from 'lodash';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize, LocalizeProps } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Card from 'components/card';
import FormFieldset from 'components/forms/form-fieldset';
import FormTextInput from 'components/forms/form-text-input';
import StepWrapper from 'signup/step-wrapper';
import { getBusinessAddress, getBusinessName } from 'state/signup/steps/business-details/selectors';
import { setBusinessAddress, setBusinessName } from 'state/signup/steps/business-details/actions';
import { recordTracksEvent } from 'state/analytics/actions';
import { saveSignupStep, submitSignupStep } from 'state/signup/progress/actions';
import wpcom from 'lib/wp';

/**
 * Style dependencies
 */
import './style.scss';

interface Props {
	flowName: string;
	goToNextStep: ( flowName?: string ) => void;
	positionInFlow: number;
	signupProgress: object[];
	stepName: string;
}

interface Suggestion {
	id: string;
	title: string;
	address: string;
}

enum RequestStatus {
	NotRequested = 'notRequested',
	Loading = 'loading',
	Success = 'success',
	Error = 'error',
}

type SuggestionsRequest =
	| { status: RequestStatus.NotRequested }
	| { status: RequestStatus.Loading }
	| { status: RequestStatus.Error; errorMessage: string }
	| { status: RequestStatus.Success; suggestions: Suggestion[] };

interface State {
	suggestionsRequest: SuggestionsRequest;
}

class BusinessDetails extends Component< Props & ConnectedProps & LocalizeProps, State > {
	state: State = {
		suggestionsRequest: {
			status: RequestStatus.NotRequested,
		},
	};

	componentDidMount() {
		this.props.saveSignupStep( { stepName: this.props.stepName } );
	}

	handleInputChange = ( action: 'setBusinessName' | 'setBusinessAddress' ) => ( {
		currentTarget: { value = '' },
	} ) => this.props[ action ]( value );

	handleSubmit = ( placeId: string | null ) => {
		const { businessName, flowName, stepName } = this.props;

		// siteTitle is a required dependency to complete the signup flow.
		this.props.submitSignupStep( { stepName, flowName }, { businessName, placeId } );
		this.props.goToNextStep();
	};

	suggestionsSearch = ( event: React.FormEvent ) => {
		event.preventDefault();
		const { businessAddress, businessName } = this.props;
		this.setState( { suggestionsRequest: { status: RequestStatus.Loading } } );

		wpcom
			.undocumented()
			.getRivetSuggestions( { name: businessName, address: businessAddress } )
			.then( ( response: any ) => {
				this.setState( {
					suggestionsRequest: {
						status: RequestStatus.Success,
						suggestions: get( response, 'suggestions[0].list', [] ),
					},
				} );
			} )
			.catch( ( response: any ) => {
				this.setState( {
					suggestionsRequest: {
						status: RequestStatus.Error,
						errorMessage: response.message || '',
					},
				} );
			} );
	};

	renderSuggestions = () => {
		const { translate } = this.props;
		const { suggestionsRequest } = this.state;

		switch ( suggestionsRequest.status ) {
			case RequestStatus.Success:
				return (
					<Card>
						{ suggestionsRequest.suggestions.length
							? suggestionsRequest.suggestions.map( suggestion => (
									<Card
										displayAsLink
										key={ suggestion.id }
										onClick={ this.handleSubmit.bind( this, suggestion.id ) }
									>
										<div>
											<strong>{ suggestion.title }</strong>
										</div>
										<div>{ suggestion.address }</div>
									</Card>
							  ) )
							: translate( 'No results for that location.' ) }
					</Card>
				);
			case RequestStatus.Error:
				return (
					<Card>
						{ suggestionsRequest.errorMessage ||
							translate( 'There was an error searching that location. Please try again.' ) }
					</Card>
				);
			case RequestStatus.NotRequested:
			case RequestStatus.Loading:
				return null;
		}
	};

	renderContent = () => {
		const { businessAddress, businessName } = this.props;
		const { suggestionsRequest } = this.state;

		return (
			<div className="business-details__wrapper">
				<form>
					<FormFieldset className="business-details__field-control">
						<FormTextInput
							id="title"
							name="title"
							placeholder=""
							onChange={ this.handleInputChange( 'setBusinessName' ) }
							value={ businessName }
							maxLength={ 100 }
							autoFocus // eslint-disable-line jsx-a11y/no-autofocus
							aria-label="Business Name"
						/>
						<FormTextInput
							id="address"
							name="address"
							placeholder=""
							onChange={ this.handleInputChange( 'setBusinessAddress' ) }
							value={ businessAddress }
							maxLength={ 800 }
							aria-label="Business Address"
						/>
						<Button
							primary
							type="submit"
							busy={ suggestionsRequest.status === RequestStatus.Loading }
							onClick={ this.suggestionsSearch }
						>
							{ this.props.translate( 'Search' ) }
						</Button>
					</FormFieldset>
				</form>
				{ this.renderSuggestions() }
			</div>
		);
	};

	render() {
		return (
			<StepWrapper
				flowName={ this.props.flowName }
				stepName={ this.props.stepName }
				positionInFlow={ this.props.positionInFlow }
				fallbackHeaderText={ this.props.translate( 'Create your site.' ) }
				signupProgress={ this.props.signupProgress }
				stepContent={ this.renderContent() }
			/>
		);
	}
}

const mapStateToProps = ( state: object ) => ( {
	businessAddress: getBusinessAddress( state ),
	businessName: getBusinessName( state ),
} );

const mapDispatchToProps = {
	saveSignupStep,
	setBusinessAddress,
	setBusinessName,
	submitSignupStep,
	recordTracksEvent,
};

type ConnectedProps = ReturnType< typeof mapStateToProps > & typeof mapDispatchToProps;

export default connect(
	mapStateToProps,
	mapDispatchToProps
)( localize( BusinessDetails ) );
