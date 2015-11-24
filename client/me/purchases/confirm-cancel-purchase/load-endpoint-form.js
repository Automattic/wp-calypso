/**
 * External Dependencies
 **/
import toArray from 'lodash/lang/toArray';
import zipObject from 'lodash/array/zipObject';

/**
 * Internal Dependencies
 **/
import wp from 'lib/wp';

const wpcom = wp.undocumented();

function loadEndpointForm( options ) {
	const { selectedPurchase, selectedSite, container, onSubmit } = options,
		{ id, productId } = selectedPurchase;

	wpcom.getCancellationPageHTML( id, productId, ( error, response ) => {
		if ( error ) {
			throw new Error( error );
		}

		container.innerHTML = response.html;

		initializeForm( {
			form: container.querySelector( 'form' ),
			onSubmit,
			selectedPurchase,
			selectedSite
		} );
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
	const inputs = zipObject(
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
		confirmCheckbox = form.querySelector( '#confirm' ),
		submitButton = form.querySelector( 'input[type=submit]' );

	submitButton.disabled = ! form.querySelector( '#confirm' ).checked;

	form.addEventListener( 'submit', ( event ) => {
		event.preventDefault();

		if ( ! form.querySelector( '#confirm' ).checked ) {
			return;
		}

		submitForm( options );
	} );

	domainCancelReason.addEventListener( 'change', ( event ) => {
		showDomainReasonDetail( {
			form,
			selectValue: event.target.value
		} );
	} );

	confirmCheckbox.addEventListener( 'click', ( event ) => {
		submitButton.disabled = ! event.target.checked;
	} );
}

function showDomainReasonDetail( { form, selectValue } ) {
	const reasonsDiv = form.querySelector( '#domain_cancel_reasons' );
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
