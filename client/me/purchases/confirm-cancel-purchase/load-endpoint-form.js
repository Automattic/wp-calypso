/**
 * External Dependencies
 **/
import toArray from 'lodash/toArray';
import fromPairs from 'lodash/fromPairs';

/**
 * Internal Dependencies
 **/
import wp from 'lib/wp';

const wpcom = wp.undocumented();

function loadEndpointForm( selectedPurchase, onSuccess ) {
	const { id, productId } = selectedPurchase;

	wpcom.getCancellationPageHTML( id, productId, ( error, response ) => {
		if ( error ) {
			throw new Error( error );
		}

		onSuccess( response.html, initializeForm );
	} );
}

function initializeForm( options ) {
	const { form } = options;

	if ( ! form ) {
		return;
	}

	switch ( form.id ) {
		case 'domain_cancel_form':
			initializeDomainCancelForm( options );
			break;

		default:
			initializeDefaultForm( options );
	}
}

function initializeDefaultForm( options ) {
	const { form } = options;

	form.addEventListener( 'submit', ( event ) => {
		event.preventDefault();
		submitForm( options );
	} );
}

function submitForm( { form, onSubmit, selectedPurchase, selectedSite } ) {
	const button = form.querySelector( 'input[type=submit]' ),
		formData = getFormData( { form, selectedPurchase, selectedSite } );

	button.disabled = true;

	wpcom.cancelAndRefundPurchase( selectedPurchase.id, formData, ( error, response ) => {
		if ( error ) {
			button.disabled = false;
			onSubmit( error );
			return;
		}

		onSubmit( null, response );
	} );
}

function getFormData( { form, selectedPurchase, selectedSite } ) {
	const inputs = fromPairs(
		toArray( form.elements )
			.filter( ( element ) => {
				return ( element.type === 'radio' ) ? element.checked : true;
			} )
			.map( ( element ) => [ element.name, element.value ] )
	);

	// add product_id, blog_id
	inputs.product_id = selectedPurchase.productId;
	inputs.blog_id = selectedSite.ID;
	return inputs;
}

function initializeDomainCancelForm( options ) {
	const { form } = options,
		domainCancelReason = form.querySelector( '#domain_cancel_reason' ),
		reasonsDiv = form.querySelector( '#domain_cancel_reasons' );

	domainCancelReason.addEventListener( 'change', ( event ) => {
		showDomainCancelReasonDetail( reasonsDiv, event.target.value );
	} );

	toArray( reasonsDiv.children ).forEach( ( div ) => {
		const confirmCheckbox = div.querySelector( 'input[type=checkbox]' ),
			submitButton = div.querySelector( 'input[type=submit]' );

		if ( confirmCheckbox && submitButton ) {
			submitButton.disabled = ! confirmCheckbox.checked;

			confirmCheckbox.addEventListener( 'click', ( event ) => {
				submitButton.disabled = ! event.target.checked;
			} );
		}
	} );

	form.addEventListener( 'submit', ( event ) => {
		event.preventDefault();

		submitForm( options );
	} );
}

function showDomainCancelReasonDetail( reasonsDiv, selectValue ) {
	toArray( reasonsDiv.children ).forEach( ( div ) => div.className = 'hidden' );

	let selected;
	switch ( selectValue ) {
		case 'pick':
			selected = null;
			break;
		case 'other_host':
			selected = '#div_other_host';
			break;
		case 'transfer':
			selected = '#div_transfer';
			break;
		case 'misspelled':
			selected = '#div_misspelled';
			break;
		case 'expectations':
		case 'wanted_free':
		case 'other':
			selected = '#domain_cancel_form_controls';
			break;
	}

	if ( selected ) {
		reasonsDiv.querySelector( selected ).className = '';
	}
}

export default loadEndpointForm;
