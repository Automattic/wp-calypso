import './view.scss';
import domReady from '@wordpress/dom-ready';
import { useState, render } from '@wordpress/element';
import PricingPlans from './components/pricing-plans';
import Skeleton from './components/skeleton';
import usePricingPlans from './hooks/pricing-plans';
import type { BlockAttributes } from './types';

const ViewPricingPlans = ( { attributes }: { attributes: BlockAttributes } ) => {
	const { data: plans, isLoading } = usePricingPlans();
	const [ dummyAttributes, setDummyAttributes ] = useState( attributes );
	const setAttributes = ( newValues: Partial< BlockAttributes > ) => {
		setDummyAttributes( ( values: BlockAttributes ) => ( { ...values, ...newValues } ) );
	};

	if ( isLoading || ! plans?.length ) {
		return <Skeleton />;
	}

	return (
		<PricingPlans attributes={ dummyAttributes } setAttributes={ setAttributes } plans={ plans } />
	);
};

function renderPricingPlansBlock( element: HTMLElement | Element ) {
	const attributes = JSON.parse( ( element as HTMLElement ).dataset.attributes ?? '{}' );

	render( <ViewPricingPlans attributes={ attributes } />, element );
}

domReady( () => {
	document
		.querySelectorAll( '.a8c-happy-tools-pricing-plans-block-placeholder' )
		.forEach( renderPricingPlansBlock );
} );
