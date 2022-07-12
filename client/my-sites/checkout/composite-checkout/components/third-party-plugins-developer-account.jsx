import { localize } from 'i18n-calypso';
import { useDispatch, useSelector } from 'react-redux';
import FormCheckbox from 'calypso/components/forms/form-checkbox';
import { setThirdPartyDevsAccountConsent } from 'calypso/state/marketplace/purchase-flow/actions';
import { getPurchaseFlowState } from 'calypso/state/marketplace/purchase-flow/selectors';
import { isMarketplaceProduct } from 'calypso/state/products-list/selectors';

/* eslint-disable wpcalypso/jsx-classname-namespace */

function ThirdPartyDevsAccount( { cart, translate } ) {
	const dispatch = useDispatch();

	const isSelected = useSelector(
		( state ) => getPurchaseFlowState( state ).thirdPartyDevsAccountConsent
	);

	const hasMarketplaceProduct = useSelector( ( state ) => {
		return cart?.products?.some( ( p ) => isMarketplaceProduct( state, p.product_slug ) );
	} );

	if ( ! hasMarketplaceProduct ) {
		return null;
	}

	const message = translate(
		'You agree that an account may be created on a third party developer’s site related to the products you have purchased.'
	);

	function handleThirdPartyDevAccountConsent( e ) {
		dispatch( setThirdPartyDevsAccountConsent( Boolean( e.target.checked ) ) );
	}

	return (
		<div className="checkout-step" style={ { padding: '24px' } }>
			<FormCheckbox
				style={ { margin: ' 8px 0 16px -24px' } }
				onChange={ handleThirdPartyDevAccountConsent }
				checked={ isSelected }
			/>
			<span style={ { fontSize: '12px', marginLeft: 0 } }>{ message }</span>
		</div>
	);
}

export default localize( ThirdPartyDevsAccount );
