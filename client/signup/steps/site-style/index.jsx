/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import classNames from 'classnames';
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';

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

/**
 * Style dependencies
 */
import './style.scss';

// TODO: for testing only. Getting from backend or hardcoded in source?
const siteStyleOptions = [
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
];

export class SiteStyleStep extends Component {
	static propTypes = {
		flowName: PropTypes.string,
		goToNextStep: PropTypes.func.isRequired,
		positionInFlow: PropTypes.number,
		submitStep: PropTypes.func.isRequired,
		signupProgress: PropTypes.array,
		stepName: PropTypes.string,
	};

	state = {
		siteStyle: 'pub/business',
	};

	handleStyleOptionChange = event => this.setState( { siteStyle: event.currentTarget.value } );

	renderStyleOptions() {
		return siteStyleOptions.map( siteStyleProperties => {
			const isChecked = siteStyleProperties.value === this.state.siteStyle;
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
						<form className="site-style__form" onSubmit={ this.props.submitStep }>
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
					{
						// TODO: Site preview component
						this.state.siteStyle
					}
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

export default connect(
	state => ( {
		siteStyle: getSiteStyle( state ),
	} ),
	( dispatch, ownProps ) => ( {
		submitStep: () => {},
	} )
)( localize( SiteStyleStep ) );
