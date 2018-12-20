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
import { getSiteStyleOptions } from 'lib/signup/site-styles';
import { getSignupStepsSiteTopic } from 'state/signup/steps/site-topic/selectors';

/**
 * Style dependencies
 */
import './style.scss';

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
		const selectedStyle =
			find( props.styleOptions, [ 'id', props.siteStyle ] ) || props.styleOptions[ 0 ];
		this.state = {
			siteStyle: selectedStyle.id,
			themeSlugWithRepo: selectedStyle.theme,
		};
	}

	componentDidMount() {
		SignupActions.saveSignupStep( {
			stepName: this.props.stepName,
		} );
	}

	handleStyleOptionChange = event => {
		const selectedStyle = find( this.props.styleOptions, [ 'id', event.currentTarget.value ] );
		this.setState(
			{
				siteStyle: selectedStyle.id,
				themeSlugWithRepo: selectedStyle.theme,
			},
			() => this.props.setSiteStyle( selectedStyle.id )
		);
	};

	handleSubmit = event => {
		event.preventDefault();
		this.props.submitSiteStyle( this.state );
	};

	renderStyleOptions() {
		return this.props.styleOptions.map( siteStyleProperties => {
			const isChecked = siteStyleProperties.id === this.state.siteStyle;
			const optionLabelClasses = classNames( 'site-style__option-label', {
				'is-checked': isChecked,
				[ `site-style__variation-${ siteStyleProperties.id }` ]: siteStyleProperties.id,
			} );
			return (
				<FormLabel
					htmlFor={ siteStyleProperties.id }
					className={ optionLabelClasses }
					key={ siteStyleProperties.id }
					title={ siteStyleProperties.description || '' }
				>
					<FormRadio
						id={ siteStyleProperties.id }
						value={ siteStyleProperties.id }
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

	renderContent = () => (
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
	submitSiteStyle: ( { siteStyle, themeSlugWithRepo } ) => {
		const { flowName, stepName, goToNextStep } = ownProps;
		SignupActions.submitSignupStep(
			{
				processingMessage: i18n.translate( 'Collecting your information' ),
				stepName,
			},
			[],
			{
				siteStyle,
				themeSlugWithRepo,
			}
		);

		goToNextStep( flowName );
	},
	setSiteStyle: siteStyle => dispatch( setSiteStyle( siteStyle ) ),
} );

export default connect(
	state => ( {
		siteStyle: getSiteStyle( state ),
		siteType: getSiteType( state ),
		styleOptions: getSiteStyleOptions( getSignupStepsSiteTopic( state ) ),
	} ),
	mapDispatchToProps
)( localize( SiteStyleStep ) );
