import { TERM_ANNUALLY, TERM_MONTHLY } from '@automattic/calypso-products';
import { InspectorControls } from '@wordpress/block-editor';
import { BlockEditProps } from '@wordpress/blocks';
import {
	PanelRow,
	PanelBody,
	RadioControl,
	CheckboxControl,
	TextControl,
} from '@wordpress/components';
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import clsx from 'clsx';
import { FunctionComponent } from 'react';
import usePlanOptions from '../hooks/plan-options';
import { BlockPlan } from '../hooks/pricing-plans';
import { BlockAttributes } from '../types';

interface Props {
	plans: BlockPlan[];
}

const NORMALIZE_DOMAIN_REGEX = /(?:^http(?:s)?:)?(?:[/]*)(?:www\.)?([^/?]*)(?:.*)$/gi;
const VALIDATE_DOMAIN_REGEX =
	/^(([A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)\.)+([A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)$/;
const VALIDATE_AFFILIATE_REGEX = /^https:\/\/automattic\.pxf\.io\/.+/;

const BlockSettings: FunctionComponent<
	Pick< BlockEditProps< BlockAttributes >, 'attributes' | 'setAttributes' > & Props
> = ( { attributes, setAttributes, plans } ) => {
	const { productSlug, planTypeOptions, domain, affiliateLink } = attributes;
	const planOptions = usePlanOptions( plans );
	const currentPlan = plans?.find( ( plan ) => plan.productSlug === productSlug );
	const [ newDomainInputValue, setNewDomainInputValue ] = useState( domain );
	const [ newAffiliateLinkInputValue, setNewAffiliateLinkInputValue ] = useState( affiliateLink );

	const setPlan = ( type: string, term: string ) => {
		const plan = plans?.find( ( plan ) => plan.type === type && plan.term === term );
		setAttributes( { productSlug: plan?.productSlug } );
	};

	const onPlanTermChange = ( newPlanTerm: string ) => {
		setPlan( currentPlan?.type ?? plans[ 0 ].type, newPlanTerm );
	};

	const onPlanTypeToggle = ( planType: string, checked: boolean ) => {
		if ( checked ) {
			const newPlanTypeOptions = [ ...new Set( [ ...planTypeOptions, planType ] ) ];
			setAttributes( { planTypeOptions: newPlanTypeOptions } );
		} else {
			const newPlanTypeOptions = planTypeOptions.filter( ( type ) => type !== planType );
			setAttributes( {
				planTypeOptions: newPlanTypeOptions,
			} );
			if ( newPlanTypeOptions.length === 1 ) {
				setPlan( newPlanTypeOptions[ 0 ], currentPlan?.term ?? plans[ 0 ].term );
			}
		}
	};

	const isDisabled = ( value: string ) =>
		planTypeOptions.includes( value ) && planTypeOptions.length === 1;

	const isChecked = ( value: string ) => planTypeOptions.includes( value );

	const onDomainChange = ( value: string ) => {
		setNewDomainInputValue( value );

		if ( ! value ) {
			setAttributes( { domain: false } );
			return;
		}

		const normalizedDomain = value.replace( NORMALIZE_DOMAIN_REGEX, '$1' );
		if ( VALIDATE_DOMAIN_REGEX.test( normalizedDomain ) ) {
			setAttributes( { domain: normalizedDomain } );
		}
	};

	const onAffiliateChange = ( value: string ) => {
		setNewAffiliateLinkInputValue( value );

		if ( ! value || ! VALIDATE_AFFILIATE_REGEX.test( value ) ) {
			setAttributes( { affiliateLink: false } );
			return;
		}

		setAttributes( { affiliateLink: value } );
	};

	return (
		<InspectorControls>
			<PanelBody
				className="hb-pricing-plans-embed__settings"
				title={ __( 'Basic', 'happy-blocks' ) }
				initialOpen
			>
				<PanelRow>
					{ planOptions.map( ( option ) => (
						<CheckboxControl
							className={ clsx( {
								'hb-pricing-plans-embed__settings-checkbox--disabled': isDisabled( option.value ),
							} ) }
							key={ option.value }
							label={ option.label }
							checked={ isChecked( option.value ) }
							disabled={ isDisabled( option.value ) }
							onChange={ ( checked ) => onPlanTypeToggle( option.value, checked ) }
						/>
					) ) }
					<TextControl
						className="hb-pricing-plans-embed__settings-domain"
						label={ __( 'Domain', 'happy-blocks' ) }
						value={ newDomainInputValue || '' }
						help={ __(
							'Enter a valid domain name or leave empty to avoid showing any domain',
							'happy-blocks'
						) }
						onChange={ onDomainChange }
					/>
					<TextControl
						className="hb-pricing-plans-embed__settings-domain"
						label={ __( 'Affiliate Link', 'happy-blocks' ) }
						value={ newAffiliateLinkInputValue || '' }
						help={ __( 'Enter the affiliate link for the Upgrade CTA', 'happy-blocks' ) }
						onChange={ onAffiliateChange }
					/>
					<RadioControl
						label={ __( 'Price', 'happy-blocks' ) }
						selected={ currentPlan?.term }
						options={ [
							{ label: __( 'Monthly', 'happy-blocks' ), value: TERM_MONTHLY },
							{ label: __( 'Annual', 'happy-blocks' ), value: TERM_ANNUALLY },
						] }
						onChange={ onPlanTermChange }
					/>
				</PanelRow>
			</PanelBody>
		</InspectorControls>
	);
};

export default BlockSettings;
