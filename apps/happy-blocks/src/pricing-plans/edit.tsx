import './edit.scss';
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

export const Edit: FunctionComponent< BlockEditProps< BlockAttributes > > = ( {
	attributes,
	setAttributes,
} ) => {
	const { data: plans, isLoading } = usePricingPlans();

	// Set default values for attributes which are required when rendering the block
	// See https://github.com/WordPress/gutenberg/issues/7342
	useEffect( () => {
		setAttributes( {
			productSlug: attributes.productSlug ?? config.plans[ 0 ],
		} );
	}, [ attributes.productSlug, setAttributes ] );

	const blockProps = useBlockProps();

	if ( isLoading || ! plans ) {
		return <Skeleton />;
	}

	return (
		<div { ...blockProps }>
			<BlockSettings plans={ plans } attributes={ attributes } setAttributes={ setAttributes } />
			<PricingPlans plans={ plans } attributes={ attributes } setAttributes={ setAttributes } />
		</div>
	);
};
