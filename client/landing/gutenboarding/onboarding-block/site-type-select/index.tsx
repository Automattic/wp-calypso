/**
 * External dependencies
 */
import { useDispatch, useSelect } from '@wordpress/data';
import { __ as NO__ } from '@wordpress/i18n';
import React from 'react';
import { map } from 'lodash';

/**
 * Internal dependencies
 */
import { STORE_KEY } from '../../stores/onboard';
import { SiteType, isFilledFormValue } from '../../stores/onboard/types';
import { StepInputProps } from '../stepper-wizard';
import Question from '../question';
import './style.scss';

const siteTypeOptions: Record< SiteType, string > = {
	[ SiteType.BLOG ]: NO__( 'with a blog' ),
	[ SiteType.BUSINESS ]: NO__( 'for a business' ),
	[ SiteType.PORTFOLIO ]: NO__( 'to share a portfolio' ),
	[ SiteType.STORE ]: NO__( 'for a store' ),
};

/* eslint-disable wpcalypso/jsx-classname-namespace */

const SiteTypeSelect = ( { onSelect, onExpand, isActive }: StepInputProps ) => {
	const { siteType } = useSelect( select => select( STORE_KEY ).getState() );
	const { setSiteType } = useDispatch( STORE_KEY );

	const selectSiteType = ( e: React.ChangeEvent< HTMLInputElement > ) => {
		setSiteType( e.target.value as SiteType );
		onSelect();
	};

	const questionLabel = isFilledFormValue( siteType )
		? NO__( 'I want to create a website ' )
		: NO__( 'Setting up a website ' );

	const displayValue = isFilledFormValue( siteType ) ? siteTypeOptions[ siteType ] : '';

	return (
		<Question
			label={ questionLabel }
			displayValue={ displayValue }
			isActive={ isActive }
			onExpand={ onExpand }
		>
			<ul className="onboarding-block__multi-question">
				{ map( siteTypeOptions, ( label, value ) => (
					<li key={ value } className={ value === siteType ? 'selected' : '' }>
						<label>
							<input
								name="onboarding_site_type"
								onChange={ selectSiteType }
								type="radio"
								value={ value }
							/>
							<span className="onboarding-block__multi-question-choice">{ label }</span>
						</label>
					</li>
				) ) }
			</ul>
		</Question>
	);
};

export default SiteTypeSelect;
