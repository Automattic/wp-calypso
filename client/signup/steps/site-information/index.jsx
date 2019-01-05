/** @format */
/**
 * External dependencies
 */
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import i18n, { localize } from 'i18n-calypso';
import { get, trim } from 'lodash';

/**
 * Internal dependencies
 */
import StepWrapper from 'signup/step-wrapper';
import SignupActions from 'lib/signup/actions';
import { getSiteInformation } from 'state/signup/steps/site-information/selectors';
import { setSiteInformation } from 'state/signup/steps/site-information/actions';
import { getSiteType } from 'state/signup/steps/site-type/selectors';
import Button from 'components/button';
import FormTextInput from 'components/forms/form-text-input';
import FormLabel from 'components/forms/form-label';
import FormFieldset from 'components/forms/form-fieldset';
import InfoPopover from 'components/info-popover';
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
		fieldLabel: PropTypes.string,
		fieldDescription: PropTypes.string,
		fieldPlaceholder: PropTypes.string,
		siteInformationValue: PropTypes.string,
		informationType: PropTypes.oneOf( [ 'title', 'address', 'phone' ] ),
		translate: PropTypes.func.isRequired,
	};

	static defaultProps = {
		headerText: '',
		fieldLabel: '',
		fieldDescription: '',
		fieldPlaceholder: '',
		siteInformationValue: '',
	};

	componentDidMount() {
		SignupActions.saveSignupStep( {
			stepName: this.props.stepName,
		} );
	}

	handleInputChange = event => this.props.updateStep( event.currentTarget.value );

	handleSubmit = event => {
		event.preventDefault();
		this.props.submitStep( this.props.siteInformationValue );
	};

	getFieldTexts() {
		const {
			fieldLabel,
			fieldDescription,
			fieldPlaceholder,
			informationType,
			siteType,
		} = this.props;
		return {
			fieldLabel:
				'title' === informationType
					? getSiteTypePropertyValue( 'slug', siteType, 'siteTitleLabel' ) || ''
					: fieldLabel,
			fieldPlaceholder:
				'title' === informationType
					? getSiteTypePropertyValue( 'slug', siteType, 'siteTitlePlaceholder' ) || ''
					: fieldPlaceholder,
			fieldDescription,
		};
	}

	renderContent() {
		const { translate, informationType, siteInformationValue } = this.props;
		const { fieldLabel, fieldPlaceholder, fieldDescription } = this.getFieldTexts();

		return (
			<div className="site-information__wrapper">
				<div
					className={ classNames(
						'site-information__form-wrapper',
						`site-information__${ informationType }`
					) }
				>
					<form>
						<FormFieldset>
							<FormLabel htmlFor={ informationType }>
								{ fieldLabel }
								<InfoPopover className="site-information__info-popover" position="top">
									{ fieldDescription }
								</InfoPopover>
							</FormLabel>
							<FormTextInput
								id={ informationType }
								name={ informationType }
								placeholder={ fieldPlaceholder }
								onChange={ this.handleInputChange }
								value={ siteInformationValue }
							/>
							<Button primary type="submit" onClick={ this.handleSubmit }>
								{ translate( 'Continue' ) }
							</Button>
						</FormFieldset>
					</form>
				</div>
			</div>
		);
	}

	render() {
		const { flowName, positionInFlow, signupProgress, stepName, headerText } = this.props;

		return (
			<StepWrapper
				flowName={ flowName }
				stepName={ stepName }
				positionInFlow={ positionInFlow }
				headerText={ headerText }
				fallbackHeaderText={ headerText }
				signupProgress={ signupProgress }
				stepContent={ this.renderContent() }
			/>
		);
	}
}

export default connect(
	( state, ownProps ) => ( {
		siteInformationValue: get( getSiteInformation( state ), ownProps.informationType, '' ),
		siteType: getSiteType( state ),
	} ),
	( dispatch, ownProps ) => {
		return {
			submitStep: siteInformationValue => {
				siteInformationValue = trim( siteInformationValue );
				dispatch( setSiteInformation( { [ ownProps.informationType ]: siteInformationValue } ) );
				dispatch(
					recordTracksEvent( 'calypso_signup_actions_submit_site_information', {
						[ `site_${ ownProps.informationType }` ]: siteInformationValue || 'N/A',
					} )
				);

				// Create site
				SignupActions.submitSignupStep(
					{
						processingMessage: i18n.translate( 'Populating your contact information.' ),
						stepName: ownProps.stepName,
						flowName: ownProps.flowName,
					},
					[],
					{
						[ ownProps.informationType ]: siteInformationValue,
					}
				);
				ownProps.goToNextStep( ownProps.flowName );
			},
			updateStep: siteInformationValue =>
				dispatch( setSiteInformation( { [ ownProps.informationType ]: siteInformationValue } ) ),
		};
	}
)( localize( SiteInformation ) );
