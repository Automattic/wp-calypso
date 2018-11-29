/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import i18n, { localize } from 'i18n-calypso';
import { debounce, get, random, trim } from 'lodash';

/**
 * Internal dependencies
 */
import StepWrapper from 'signup/step-wrapper';
import SignupActions from 'lib/signup/actions';
import { isUserLoggedIn } from 'state/current-user/selectors';
import { getSiteInformation } from 'state/signup/steps/site-information/selectors';
import { setSiteInformation } from 'state/signup/steps/site-information/actions';
import { getSiteTitle } from 'state/signup/steps/site-title/selectors';
import { getSiteType } from 'state/signup/steps/site-type/selectors';
import { setSiteTitle } from 'state/signup/steps/site-title/actions';
import Card from 'components/card';
import Button from 'components/button';
import FormTextInput from 'components/forms/form-text-input';
import FormTelInput from 'components/forms/form-tel-input';
import FormTextarea from 'components/forms/form-textarea';
import FormLabel from 'components/forms/form-label';
import FormFieldset from 'components/forms/form-fieldset';
import InfoPopover from 'components/info-popover';
import { getSiteTypePropertyValue } from 'lib/signup/site-type';
import { recordTracksEvent } from 'state/analytics/actions';
import QueryDomainsSuggestions from 'components/data/query-domains-suggestions';
import {
	getDomainsSuggestions,
	getDomainsSuggestionsError,
	isRequestingDomainsSuggestions,
} from 'state/domains/suggestions/selectors';
import userFactory from 'lib/user';

/**
 * Style dependencies
 */
import './style.scss';

const user = userFactory();

function filterAlphaNumericChars( str ) {
	return str.replace( /[^\w\u0080-\u017f]+/g, '' );
}

class SiteInformation extends Component {
	constructor( props ) {
		super( props );
		this.state = {
			name: props.siteTitle,
			address: props.siteInformation.address || '',
			email: props.siteInformation.email || '',
			phone: props.siteInformation.phone || '',
			needToQueryDomains: ! props.domainsSuggestions,
		};
		this.debouncedSetSiteTitle = debounce( this.setSiteTitle, 500 );
	}

	componentDidMount() {
		SignupActions.saveSignupStep( {
			stepName: this.props.stepName,
		} );
	}

	UNSAFE_componentWillReceiveProps( nextProps ) {
		const { domainsSuggestions } = this.props;

		if ( nextProps.domainsSuggestions !== domainsSuggestions ) {
			this.setState( { needToQueryDomains: false } );
		}

		if ( ! nextProps.domainsSuggestions && nextProps.domainsSuggestionsError ) {
			if ( nextProps.domainsSuggestionsError.error === 'empty_results' ) {
				this.setSiteTitle( this.state.name + this.props.siteType + random( 10, 99 ) );
			}
		}
	}

	setSiteTitle = title => this.props.setSiteTitle( title );

	handleInputChange = ( { target: { name, value } } ) => {
		this.setState( { [ name ]: value } );
		if ( this.props.flowName === 'onboarding-dev' ) {
			setTimeout( () => {
				this.props.updateStep( this.state );
			}, 50 );
		}
	};

	handleSubmit = event => {
		const suggestion = get( this.props, [ 'domainsSuggestions', 0 ] );

		event.preventDefault();

		this.props.submitStep( {
			...this.state,
			siteUrl: get( suggestion, 'domain_name', '' ).replace( '.wordpress.com', '' ),
			suggestion,
		} );
	};

	canSubmit() {
		if ( this.state.needToQueryDomains || this.props.isRequestingDomainsSuggestions ) {
			return false;
		}

		return get( this.props, 'domainsSuggestions.length', 0 ) > 0;
	}

	renderContent() {
		const { translate, siteType, queryObject } = this.props;
		const siteTitleLabel = getSiteTypePropertyValue( 'slug', siteType, 'siteTitleLabel' ) || '';
		const siteTitlePlaceholder =
			getSiteTypePropertyValue( 'slug', siteType, 'siteTitlePlaceholder' ) || '';
		const isBusinessSiteSelected =
			siteType === getSiteTypePropertyValue( 'slug', 'business', 'slug' );

		return (
			<div className="site-information__wrapper">
				{ queryObject.query && <QueryDomainsSuggestions { ...queryObject } /> }
				<div className="site-information__form-wrapper ">
					<form>
						<Card>
							<FormFieldset>
								<FormLabel htmlFor="name">
									{ siteTitleLabel }
									<InfoPopover className="site-information__info-popover" position="top">
										{ translate(
											"We'll use this as your site title. Don't worry, you can change this later."
										) }
									</InfoPopover>
								</FormLabel>
								<FormTextInput
									id="name"
									name="name"
									placeholder={ siteTitlePlaceholder }
									onChange={ this.handleInputChange }
									value={ this.state.name }
								/>
							</FormFieldset>

							{ isBusinessSiteSelected && (
								<>
									<FormFieldset>
										<FormLabel htmlFor="address">
											{ translate( 'Address' ) }
											<InfoPopover className="site-information__info-popover" position="top">
												{ translate( 'Where can people find your business?' ) }
											</InfoPopover>
										</FormLabel>
										<FormTextarea
											id="address"
											name="address"
											placeholder={ 'E.g. 60 29th Street #343\nSan Francisco, CA\n94110' }
											onChange={ this.handleInputChange }
											value={ this.state.address }
										/>
									</FormFieldset>
									<FormFieldset>
										<FormLabel htmlFor="email">
											{ translate( 'Contact Email' ) }
											<InfoPopover className="site-information__info-popover" position="top">
												{ translate( 'Does your business have an email address?' ) }
											</InfoPopover>
										</FormLabel>
										<FormTextInput
											id="email"
											name="email"
											type="email"
											placeholder={ 'E.g. email@domain.com' }
											onChange={ this.handleInputChange }
											value={ this.state.email }
										/>
									</FormFieldset>
									<FormFieldset>
										<FormLabel htmlFor="phone">
											{ translate( 'Phone number' ) }
											<InfoPopover className="site-information__info-popover" position="top">
												{ translate( 'How can people contact you?' ) }
											</InfoPopover>
										</FormLabel>
										<FormTelInput
											id="phone"
											name="phone"
											placeholder={ translate( 'E.g. (555) 555-5555' ) }
											onChange={ this.handleInputChange }
											value={ this.state.phone }
										/>
									</FormFieldset>
								</>
							) }

							<div className="site-information__submit-wrapper">
								<Button
									primary
									type="submit"
									onClick={ this.handleSubmit }
									disabled={ ! this.canSubmit() }
								>
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

		const headerText = translate( 'Almost done, just a few more things.' );
		const subHeaderText = translate( "We'll add this information to your new website." );

		return (
			<StepWrapper
				flowName={ flowName }
				stepName={ stepName }
				positionInFlow={ positionInFlow }
				headerText={ headerText }
				fallbackHeaderText={ headerText }
				subHeaderText={ subHeaderText }
				fallbackSubHeaderText={ subHeaderText }
				signupProgress={ signupProgress }
				stepContent={ this.renderContent() }
			/>
		);
	}
}

export default connect(
	state => {
		const siteType = getSiteType( state );
		const siteTitle = getSiteTitle( state );
		const queryObject = {
			query: filterAlphaNumericChars( siteTitle ) || get( user.get(), 'username' ),
			vendor: 'domainsbot',
			onlyWpcom: true,
			quantity: 1,
		};

		return {
			isLoggedIn: isUserLoggedIn( state ),
			siteInformation: getSiteInformation( state ),
			siteTitle,
			siteType,
			queryObject,
			domainsSuggestions: getDomainsSuggestions( state, queryObject ),
			domainsSuggestionsError: getDomainsSuggestionsError( state, queryObject ),
			isRequestingDomainsSuggestions: isRequestingDomainsSuggestions( state, queryObject ),
		};
	},
	( dispatch, ownProps ) => {
		function updateStep( { name, address, email, phone } ) {
			dispatch( setSiteTitle( name ) );
			dispatch( setSiteInformation( { address, email, phone } ) );
		}

		return {
			submitStep: ( { name, address, email, phone } ) => {
				const siteTitle = trim( name );
				const siteTitleTracksAttribute = siteTitle || 'N/A';
				address = trim( address );
				email = trim( email );
				phone = trim( phone );

				updateStep( { name: siteTitle, address, email, phone } );

				dispatch(
					recordTracksEvent( 'calypso_signup_actions_submit_site_information', {
						site_title: siteTitleTracksAttribute,
						address,
						email,
						phone,
					} )
				);

				// Create site
				SignupActions.submitSignupStep(
					{
						processingMessage: i18n.translate( 'Populating your contact information.' ),
						stepName: ownProps.stepName,
					},
					[],
					{
						siteTitle,
						address,
						email,
						phone,
					}
				);
				ownProps.goToNextStep( ownProps.flowName );
			},
			updateStep,
		};
	}
)( localize( SiteInformation ) );
