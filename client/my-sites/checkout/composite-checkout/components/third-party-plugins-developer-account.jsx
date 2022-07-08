import { localize } from 'i18n-calypso';
import { useDispatch, useSelector } from 'react-redux';
import FormCheckbox from 'calypso/components/forms/form-checkbox';
import FormLabel from 'calypso/components/forms/form-label';
import { getPurchaseFlowState } from 'calypso/state/marketplace/purchase-flow/selectors';

/* eslint-disable wpcalypso/jsx-classname-namespace */

function ThirdPartyDevsAccount( { translate } ) {
	const dispatch = useDispatch();

	const isSelected = useSelector(
		( state ) => getPurchaseFlowState( state ).thirdPartyDevsAccountConsent
	);

	const message = translate(
		'By clicking here, you agree that an account may be created on a third party developer’s site related to the products you have purchased.'
	);

	function handleThirdPartyDevAccountConsent( e ) {
		dispatch( {
			type: 'CHECKOUT_THIRD_PARTY_DEVS_ACCOUNT_CONSENT',
			payload: Boolean( e.target.checked ),
		} );
	}

	return (
		<FormLabel className="checkout__terms">
			<FormCheckbox onChange={ handleThirdPartyDevAccountConsent } checked={ isSelected } />
			<span>{ message }</span>
		</FormLabel>
	);
}

export default localize( ThirdPartyDevsAccount );
