/** @format */
/**
 * External dependencies
 */
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import i18n, { localize } from 'i18n-calypso';
import { each, includes, reduce, trim, size } from 'lodash';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import StepWrapper from 'signup/step-wrapper';
import SignupActions from 'lib/signup/actions';
import { getSiteInformation } from 'state/signup/steps/site-information/selectors';
import { setSiteInformation } from 'state/signup/steps/site-information/actions';
import { getSiteType } from 'state/signup/steps/site-type/selectors';
import {
	getSiteVerticalName,
	getSiteVerticalPreview,
} from 'state/signup/steps/site-vertical/selectors';
import Button from 'components/button';
import FormTextInput from 'components/forms/form-text-input';
import FormLabel from 'components/forms/form-label';
import FormFieldset from 'components/forms/form-fieldset';
import InfoPopover from 'components/info-popover';
import QueryVerticals from 'components/data/query-verticals';
import { getSiteTypePropertyValue } from 'lib/signup/site-type';
import { recordTracksEvent } from 'state/analytics/actions';

/**
 * Style dependencies
 */
import './style.scss';

export class SiteInformation extends Component {
	static propTypes = {
		flowName: PropTypes.string,
		goToNextStep: PropTypes.func.isRequired,
		positionInFlow: PropTypes.number.isRequired,
		submitStep: PropTypes.func.isRequired,
		updateStep: PropTypes.func.isRequired,
		signupProgress: PropTypes.array,
		stepName: PropTypes.string,
		siteType: PropTypes.string,
		headerText: PropTypes.string,
		subHeaderText: PropTypes.string,
		fieldLabel: PropTypes.string,
		fieldDescription: PropTypes.string,
		fieldPlaceholder: PropTypes.string,
		siteInformationValue: PropTypes.string,
		formFields: PropTypes.array,
		translate: PropTypes.func.isRequired,
		hasMultipleFieldSets: PropTypes.bool,
	};

	static defaultProps = {
		headerText: '',
		subHeaderText: '',
		fieldLabel: '',
		fieldDescription: '',
		fieldPlaceholder: '',
		formFields: [],
	};

	constructor( props ) {
		super( props );
		this.state = reduce(
			props.formFields,
			( result, fieldName ) => {
				result[ fieldName ] = props.siteInformation[ fieldName ] || '';
				return result;
			},
			{}
		);
	}

	componentDidMount() {
		SignupActions.saveSignupStep( {
			stepName: this.props.stepName,
		} );
	}

	handleInputChange = ( { currentTarget: { name = '', value = '' } } ) =>
		this.setState( { [ name ]: value }, () => this.props.updateStep( name, value ) );

	handleSubmit = event => {
		event.preventDefault();
		this.props.submitStep( this.props.siteInformation );
	};

	getFieldTexts( informationType ) {
		const { translate, siteType } = this.props;
		switch ( informationType ) {
			case 'address':
				return {
					fieldLabel: translate( 'Address' ),
					fieldDescription: translate( 'Where can people find your business?' ),
					fieldPlaceholder: 'E.g., 60 29th St, San Francisco, CA 94110',
					maxLength: 75,
				};
			case 'phone':
				return {
					fieldLabel: translate( 'Phone number' ),
					fieldDescription: translate( 'How can people contact you?' ),
					fieldPlaceholder: translate( 'E.g., (555) 555-5555' ),
					maxLength: 50,
				};
			case 'title':
				return {
					fieldLabel: getSiteTypePropertyValue( 'slug', siteType, 'siteTitleLabel' ) || '',
					fieldPlaceholder:
						getSiteTypePropertyValue( 'slug', siteType, 'siteTitlePlaceholder' ) || '',
					fieldDescription: translate(
						"We'll use this as your site title. Don't worry, you can change this later."
					),
					maxLength: 100,
				};
		}
	}

	renderSubmitButton = () => (
		<Button primary type="submit" onClick={ this.handleSubmit }>
			{ this.props.translate( 'Continue' ) }
		</Button>
	);

	renderContent() {
		const {
			hasMultipleFieldSets,
			formFields,
			shouldFetchVerticalData,
			siteVerticalName,
		} = this.props;
		return (
			<div
				className={ classNames( 'site-information__wrapper', {
					'is-single-fieldset': ! hasMultipleFieldSets,
				} ) }
			>
				{ shouldFetchVerticalData && <QueryVerticals searchTerm={ siteVerticalName } /> }
				<Card>
					<form>
						{ formFields.map( ( fieldName, idx ) => {
							const fieldTexts = this.getFieldTexts( fieldName );
							const fieldIdentifier = `site-information__${ fieldName }`;
							return (
								<div
									key={ fieldIdentifier }
									className={ classNames( 'site-information__field-control', fieldIdentifier ) }
								>
									<FormFieldset>
										<FormLabel htmlFor={ fieldName }>
											{ fieldTexts.fieldLabel }
											<InfoPopover className="site-information__info-popover" position="top">
												{ fieldTexts.fieldDescription }
											</InfoPopover>
										</FormLabel>
										<FormTextInput
											id={ fieldName }
											name={ fieldName }
											placeholder={ fieldTexts.fieldPlaceholder }
											onChange={ this.handleInputChange }
											value={ this.state[ fieldName ] }
											maxLength={ fieldTexts.maxLength }
											autoFocus={ idx === 0 } // eslint-disable-line jsx-a11y/no-autofocus
										/>
										{ ! hasMultipleFieldSets && this.renderSubmitButton() }
									</FormFieldset>
								</div>
							);
						} ) }
						{ hasMultipleFieldSets && this.renderSubmitButton() }
					</form>
				</Card>
			</div>
		);
	}

	render() {
		const {
			flowName,
			headerText,
			subHeaderText,
			positionInFlow,
			signupProgress,
			stepName,
		} = this.props;
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
				showSiteMockups={ this.props.showSiteMockups }
			/>
		);
	}
}

export default connect(
	( state, ownProps ) => {
		const siteType = getSiteType( state );
		const siteVerticalName = getSiteVerticalName( state );
		const isBusiness = 'business' === siteType;
		// Only business site types may show the full set of fields.
		// This is a bespoke check until we implement a business-only flow,
		// whereby the flow will determine the available site information steps.
		const formFields =
			! isBusiness && includes( ownProps.informationFields, 'title' )
				? [ 'title' ]
				: ownProps.informationFields;
		const shouldFetchVerticalData =
			ownProps.showSiteMockups &&
			getSiteType( state ) === 'business' &&
			getSiteVerticalPreview( state ) === '';

		return {
			formFields,
			siteInformation: getSiteInformation( state ),
			siteType,
			siteVerticalName,
			shouldFetchVerticalData,
			hasMultipleFieldSets: size( formFields ) > 1,
		};
	},
	( dispatch, ownProps ) => {
		return {
			submitStep: siteInformation => {
				const submitData = {};
				const tracksEventData = {};
				// For each field that the UI shows, gather the submit and tracking data.
				each( ownProps.informationFields, key => {
					submitData[ key ] = trim( siteInformation[ key ] );
					tracksEventData[ `user_entered_${ key }` ] = !! siteInformation[ key ];
				} );
				dispatch( setSiteInformation( submitData ) );
				dispatch(
					recordTracksEvent( 'calypso_signup_actions_submit_site_information', tracksEventData )
				);

				// Create site
				SignupActions.submitSignupStep(
					{
						processingMessage: i18n.translate( 'Populating your contact information.' ),
						stepName: ownProps.stepName,
						flowName: ownProps.flowName,
					},
					[],
					submitData
				);
				ownProps.goToNextStep( ownProps.flowName );
			},
			updateStep: ( name, value ) => dispatch( setSiteInformation( { [ name ]: value } ) ),
		};
	}
)( localize( SiteInformation ) );
