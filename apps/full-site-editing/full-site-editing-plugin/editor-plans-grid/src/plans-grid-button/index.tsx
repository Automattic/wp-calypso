/**
 * External dependencies
 */
import * as React from 'react';
import { Button } from '@wordpress/components';
import { Icon, chevronDown } from '@wordpress/icons';
import 'a8c-fse-common-data-stores';
import { useSite } from '../../../editor-domain-picker/src/hooks/use-current-domain';

import { Cart } from '@automattic/wpcom-hooks';

/**
 * Internal dependencies
 */
import PlansModal from '../plans-modal';
import { useSelectedPlan } from '../hooks/use-selected-plan';

const PlansGridButton = () => {
	const [ isPlansModalVisible, setPlansModalVisibility ] = React.useState( false );
	const currentPlan = useSelectedPlan();
	const site = useSite();

	const [ cart, setCart ] = Cart.useSiteCart?.( site?.ID );

	return (
		<>
			<Button
				aria-expanded={ isPlansModalVisible }
				aria-haspopup="menu"
				aria-pressed={ isPlansModalVisible }
				onClick={ () => setPlansModalVisibility( ( s ) => ! s ) }
			>
				<span>Plans: { currentPlan?.title }</span>
				<Icon icon={ chevronDown } size={ 22 } />
			</Button>
			Cart products count (different React tree): { cart?.products.length }
			<Button
				onClick={ () => {
					setCart( {
						...cart,
						products: [],
					} as Cart.Cart );
				} }
			>
				Clear cart
			</Button>
			{ isPlansModalVisible && <PlansModal onClose={ () => setPlansModalVisibility( false ) } /> }
		</>
	);
};

export default PlansGridButton;
