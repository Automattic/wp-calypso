import './edit.scss';
import { PLAN_BUSINESS, PLAN_ECOMMERCE, PLAN_PREMIUM } from '@automattic/calypso-products';
import { useBlockProps } from '@wordpress/block-editor';
import { BlockEditProps } from '@wordpress/blocks';
import { useEffect } from '@wordpress/element';
import { FunctionComponent } from 'react';
import BlockSettings from './components/block-settings';
import PricingPlans from './components/pricing-plans';
import Skeleton from './components/skeleton';
import config from './config';
import usePricingPlans from './hooks/pricing-plans';
import { BlockAttributes } from './types';

interface EditProps {
	defaultPlan: string;
}

const Edit: FunctionComponent< BlockEditProps< BlockAttributes > & EditProps > = ( {
	defaultPlan,
	attributes,
	setAttributes,
} ) => {
	const { data: plans, isLoading } = usePricingPlans();
	// Set default values for attributes which are required when rendering the block
	// See https://github.com/WordPress/gutenberg/issues/7342
	useEffect( () => {
		setAttributes( {
			productSlug: attributes.productSlug ?? defaultPlan,
			domain: attributes.domain ?? config.domain,
		} );
	}, [ attributes.domain, attributes.productSlug, defaultPlan, setAttributes ] );

	useEffect( () => {
		const blogIdSelect: HTMLSelectElement | null =
			document.querySelector( 'select[name="blog_id"]' );

		if ( ! blogIdSelect ) {
			return;
		}

		const updateBlogId = () => {
			const url = blogIdSelect.options[ blogIdSelect.selectedIndex ].text;
			const domain = url.replace( /^https?:\/\//, '' );

			setAttributes( { domain } );
		};

		updateBlogId();
		blogIdSelect.addEventListener( 'change', updateBlogId );

		return () => {
			blogIdSelect.removeEventListener( 'change', updateBlogId );
		};
	}, [ setAttributes ] );

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

export const EditPremium = ( props: BlockEditProps< BlockAttributes > ) => {
	return <Edit { ...props } defaultPlan={ PLAN_PREMIUM } />;
};

export const EditBusiness = ( props: BlockEditProps< BlockAttributes > ) => {
	return <Edit { ...props } defaultPlan={ PLAN_BUSINESS } />;
};

export const EditEcommerce = ( props: BlockEditProps< BlockAttributes > ) => {
	return <Edit { ...props } defaultPlan={ PLAN_ECOMMERCE } />;
};
