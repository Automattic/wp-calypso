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
import { getSiteVerticalName } from 'state/signup/steps/site-vertical/selectors';

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

	componentDidMount() {
		SignupActions.saveSignupStep( {
			stepName: this.props.stepName,
		} );
	}

	handleStyleOptionChange = event =>
		this.props.setSiteStyle( this.getSelectedStyleDataById( event.currentTarget.value ).id );

	handleSubmit = event => {
		event.preventDefault();
		this.props.submitSiteStyle( this.props.siteStyle, this.getSelectedStyleDataById().theme );
	};

	getSelectedStyleDataById( id ) {
		return find( this.props.styleOptions, [ 'id', id || this.props.siteStyle ] );
	}

	renderStyleOptions() {
		return this.props.styleOptions.map( ( siteStyleProperties, index ) => {
			const isChecked = this.props.siteStyle
				? siteStyleProperties.id === this.props.siteStyle
				: 0 === index;
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
		<div className="site-style__form-wrapper">
			<form className="site-style__form" onSubmit={ this.handleSubmit }>
				<FormFieldset className="site-style__fieldset">{ this.renderStyleOptions() }</FormFieldset>
				<div className="site-style__submit-wrapper">
					<Button primary={ true } type="submit">
						{ this.props.translate( 'Continue' ) }
					</Button>
				</div>
			</form>
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
	submitSiteStyle: ( siteStyle, themeSlugWithRepo ) => {
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
		styleOptions: getSiteStyleOptions( getSiteVerticalName( state ) ),
	} ),
	mapDispatchToProps
)( localize( SiteStyleStep ) );
