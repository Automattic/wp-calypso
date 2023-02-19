import './view.scss';
import domReady from '@wordpress/dom-ready';
import { useState, render } from '@wordpress/element';
import { FunctionComponent } from 'react';
import PricingPlans from './components/pricing-plans';
import Skeleton from './components/skeleton';
import usePricingPlans from './hooks/pricing-plans';
import { BlockAttributes } from './types';

// TODO: Added "any" to resolve type error with attributes
const ViewPricingPlans: FunctionComponent< any > = ( { attributes } ) => {
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
