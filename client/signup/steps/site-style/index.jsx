/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import classNames from 'classnames';
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import { find } from 'lodash';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormRadio from 'components/forms/form-radio';
import StepWrapper from 'signup/step-wrapper';
import { setSiteStyle } from 'state/signup/steps/site-style/actions';
import { getSiteStyle } from 'state/signup/steps/site-style/selectors';
import { getSiteType } from 'state/signup/steps/site-type/selectors';
import { getSiteStyleOptions } from 'lib/signup/site-styles';
import { recordTracksEvent } from 'state/analytics/actions';
import { getSiteTypePropertyValue } from 'lib/signup/site-type';
import { saveSignupStep, submitSignupStep } from 'state/signup/progress/actions';

/**
 * Style dependencies
 */
import './style.scss';

export class SiteStyleStep extends Component {
	static propTypes = {
		flowName: PropTypes.string,
		goToNextStep: PropTypes.func.isRequired,
		positionInFlow: PropTypes.number,
		showSiteMockups: PropTypes.bool,
		styleOptions: PropTypes.array.isRequired,
		stepName: PropTypes.string,
		siteStyle: PropTypes.string,
		translate: PropTypes.func.isRequired,
	};

	componentDidMount() {
		this.props.saveSignupStep( { stepName: this.props.stepName } );
	}

	handleStyleOptionChange = ( event ) =>
		this.props.setSiteStyle( this.getSelectedStyleDataById( event.currentTarget.value ).id );

	handleSubmit = ( event ) => {
		event.preventDefault();
		const selectedStyleData = this.getSelectedStyleDataById() || this.props.styleOptions[ 0 ];
		this.submitSiteStyle( selectedStyleData.id, selectedStyleData.theme, selectedStyleData.label );
	};

	submitSiteStyle( siteStyle, themeSlugWithRepo, styleLabel ) {
		const { flowName, stepName } = this.props;
		this.props.recordTracksEvent( 'calypso_signup_actions_submit_site_style', {
			// The untranslated 'product' name of the variation/theme
			site_style: styleLabel,
		} );
		this.props.setSiteStyle( siteStyle );
		this.props.submitSignupStep( { stepName }, { siteStyle, themeSlugWithRepo } );
		this.props.goToNextStep( flowName );
	}

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
					{ siteStyleProperties.buttonSvg }
				</FormLabel>
			);
		} );
	}

	renderContent() {
		return (
			<div className="site-style__form-wrapper">
				<form className="site-style__form" onSubmit={ this.handleSubmit }>
					<FormFieldset className="site-style__fieldset" role="radiogroup">
						{ this.renderStyleOptions() }
					</FormFieldset>
					<div className="site-style__submit-wrapper">
						<Button type="submit" primary>
							{ this.props.translate( 'Continue' ) }
						</Button>
					</div>
				</form>
			</div>
		);
	}

	render() {
		const { flowName, positionInFlow, showSiteMockups, stepName, translate } = this.props;
		const headerText = translate( 'Choose a style' );
		// for the time being we just want to fall back to the default value.
		// If we come to add segment specific copy for this item, update the first 2 args.
		const subHeaderText = getSiteTypePropertyValue( null, null, 'siteStyleSubheader' );

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
					stepContent={ this.renderContent() }
					showSiteMockups={ showSiteMockups }
				/>
			</div>
		);
	}
}

export default connect(
	( state ) => ( {
		siteStyle: getSiteStyle( state ),
		styleOptions: getSiteStyleOptions( getSiteType( state ) ),
	} ),
	{
		setSiteStyle,
		saveSignupStep,
		submitSignupStep,
		recordTracksEvent,
	}
)( localize( SiteStyleStep ) );
