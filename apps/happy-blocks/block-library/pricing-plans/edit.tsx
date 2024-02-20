import { useBlockProps } from '@wordpress/block-editor';
import { BlockEditProps } from '@wordpress/blocks';
import { useEffect } from '@wordpress/element';
import { FunctionComponent } from 'react';
import useI18nCalypsoTranslations from '../shared/use-i18n-calypso-translations';
import BlockSettings from './components/block-settings';
import PricingPlans from './components/pricing-plans';
import Skeleton from './components/skeleton';
import usePricingPlans from './hooks/pricing-plans';
import { BlockAttributes } from './types';

export const Edit: FunctionComponent< BlockEditProps< BlockAttributes > > = ( {
	attributes,
	setAttributes,
} ) => {
	const { data: plans, isLoading } = usePricingPlans();
	useI18nCalypsoTranslations();
	// Set default values for attributes which are required when rendering the block
	// See https://github.com/WordPress/gutenberg/issues/7342
	useEffect( () => {
		setAttributes( {
			productSlug: attributes.productSlug ?? attributes.defaultProductSlug,
			domain: attributes.domain,
			affiliateLink: attributes.affiliateLink,
		} );
	}, [
		attributes.defaultProductSlug,
		attributes.domain,
		attributes.productSlug,
		attributes.affiliateLink,
		setAttributes,
	] );

	useEffect( () => {
		if ( ! plans.length ) {
			return;
		}

		if ( attributes.planTypeOptions.length > 0 ) {
			return;
		}

		const defaultPlanTypeOption = plans.find(
			( plan ) => plan.productSlug === attributes.productSlug
		);

		setAttributes( {
			planTypeOptions: defaultPlanTypeOption ? [ defaultPlanTypeOption.type ] : [],
		} );
	}, [ attributes.planTypeOptions.length, attributes.productSlug, plans, setAttributes ] );

	const blockProps = useBlockProps();

	if ( isLoading || ! plans?.length ) {
		return <Skeleton />;
	}

	return (
		<div { ...blockProps }>
			<BlockSettings plans={ plans } attributes={ attributes } setAttributes={ setAttributes } />
			<PricingPlans plans={ plans } attributes={ attributes } setAttributes={ setAttributes } />
		</div>
	);
};
