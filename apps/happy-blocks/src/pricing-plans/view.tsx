import './view.scss';
import { BlockEditProps } from '@wordpress/blocks';
import { useState } from '@wordpress/element';
import { FunctionComponent } from 'react';
import PricingPlans from './components/pricing-plans';
import Skeleton from './components/skeleton';
import usePricingPlans from './hooks/pricing-plans';
import { BlockAttributes } from './types';

const ViewPricingPlans: FunctionComponent< BlockEditProps< BlockAttributes > > = ( {
	attributes,
} ) => {
	const { data: plans, isLoading } = usePricingPlans();
	const [ dummyAttributes, setDummyAttributes ] = useState( attributes );
	const setAttributes = ( newValues: Partial< BlockAttributes > ) => {
		setDummyAttributes( ( values ) => ( { ...values, ...newValues } ) );
	};

	if ( isLoading || ! plans?.length ) {
		return <Skeleton />;
	}

	return (
		<PricingPlans attributes={ dummyAttributes } setAttributes={ setAttributes } plans={ plans } />
	);
};

export default ViewPricingPlans;
