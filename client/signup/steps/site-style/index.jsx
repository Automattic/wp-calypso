/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import classNames from 'classnames';
import React, { Component } from 'react';
import i18n, { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import { find } from 'lodash';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import Button from 'components/button';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormRadio from 'components/forms/form-radio';
import StepWrapper from 'signup/step-wrapper';
import SignupActions from 'lib/signup/actions';
import { setSiteStyle } from 'state/signup/steps/site-style/actions';
import { getSiteStyle } from 'state/signup/steps/site-style/selectors';
import { getSiteType } from 'state/signup/steps/site-type/selectors';

/**
 * Style dependencies
 */
import './style.scss';

// TODO: for testing only. Getting from backend or hardcoded in source?
// siteStyleOptions[ {siteType} ]
const siteStyleOptions = {
	business: [
		{
			label: 'Modern',
			name: 'modern',
			value: 'pub/business',
		},
		{
			label: 'Pro',
			name: 'pro',
			value: 'pub/business-professional',
		},
		{
			label: 'Minimal',
			name: 'minimal',
			value: 'pub/business-minimal',
		},
		{
			label: 'Elegant',
			name: 'elegant',
			value: 'pub/business-elegant',
		},
	],
};

// TODO: check if we need to skip this step conditionally if siteType !== 'business'

export class SiteStyleStep extends Component {
	static propTypes = {
		flowName: PropTypes.string,
		goToNextStep: PropTypes.func.isRequired,
		positionInFlow: PropTypes.number,
		submitSiteStyle: PropTypes.func.isRequired,
		signupProgress: PropTypes.array,
		styleOptions: PropTypes.array.isRequired,
		stepName: PropTypes.string,
		siteStyle: PropTypes.string,
		siteType: PropTypes.string,
		translate: PropTypes.func.isRequired,
	};

	constructor( props ) {
		super( props );
		const siteStyle = props.siteStyle || 'modern';
		const selectedStyle = find( props.styleOptions, [ 'name', siteStyle ] );
		this.state = {
			siteStyle: selectedStyle.name,
			themeSlugWithRepo: selectedStyle.value,
		};
	}

	componentDidMount() {
		SignupActions.saveSignupStep( {
			stepName: this.props.stepName,
		} );
	}

	handleStyleOptionChange = event => {
		const selectedStyle = find( this.props.styleOptions, [ 'value', event.currentTarget.value ] );
		this.setState(
			{
				siteStyle: selectedStyle.name,
				themeSlugWithRepo: selectedStyle.value,
			},
			() => this.props.setSiteStyle( selectedStyle.name )
		);
	};

	handleSubmit = event => {
		event.preventDefault();
		this.props.submitSiteStyle( this.state );
	};

	renderStyleOptions() {
		return this.props.styleOptions.map( siteStyleProperties => {
			const isChecked = siteStyleProperties.value === this.state.themeSlugWithRepo;
			const optionLabelClasses = classNames( 'site-style__option-label', {
				'is-checked': isChecked,
			} );
			return (
				<FormLabel
					htmlFor={ siteStyleProperties.name }
					className={ optionLabelClasses }
					key={ siteStyleProperties.name }
				>
					<FormRadio
						id={ siteStyleProperties.name }
						value={ siteStyleProperties.value }
						name="site-style-option"
						checked={ isChecked }
						onChange={ this.handleStyleOptionChange }
					/>
					<span>
						<strong>{ siteStyleProperties.label }</strong>
					</span>
				</FormLabel>
			);
		} );
	}

	renderContent = () => {
		return (
			<div className="site-style__wrapper">
				<Card>
					<div className="site-style__form-wrapper">
						<form className="site-style__form" onSubmit={ this.handleSubmit }>
							<FormFieldset className="site-style__fieldset">
								{ this.renderStyleOptions() }
							</FormFieldset>
							<div className="site-style__submit-wrapper">
								<Button primary={ true } type="submit">
									{ this.props.translate( 'Continue' ) }
								</Button>
							</div>
						</form>
					</div>
				</Card>
			</div>
		);
	};

	render() {
		const { flowName, positionInFlow, signupProgress, stepName, translate } = this.props;
		const headerText = translate( 'Choose a style' );
		const subHeaderText = translate(
			"Choose a style for your site's theme. Don't worry, you can always change it later."
		);

		return (
			<div>
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
			</div>
		);
	}
}

const mapDispatchToProps = ( dispatch, ownProps ) => ( {
	submitSiteStyle: ( { themeSlugWithRepo } ) => {
		const { flowName, stepName, goToNextStep } = ownProps;
		SignupActions.submitSignupStep(
			{
				processingMessage: i18n.translate( 'Collecting your information' ),
				stepName,
			},
			[],
			{
				themeSlugWithRepo,
			}
		);

		goToNextStep( flowName );
	},
	setSiteStyle: siteStyle => dispatch( setSiteStyle( siteStyle ) ),
} );

export default connect(
	state => {
		const siteType = getSiteType( state );
		const siteStyle = getSiteStyle( state );
		const styleOptions = siteStyleOptions[ siteType ] || siteStyleOptions.business;
		return {
			siteStyle,
			siteType,
			styleOptions,
		};
	},
	mapDispatchToProps
)( localize( SiteStyleStep ) );
