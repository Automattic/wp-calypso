import { useSelect } from '@wordpress/data';
import { useState, useEffect } from '@wordpress/element';

/**
 * Watch the user's block selection and keep a note if they ever select a payments
 * block.
 * A payments block is any block with 'payments' in the name, like jetpack/simple-payments
 * or jetpack/recurring-payments.
 * Selecting a block whose direct parent has 'payments' in the name also counts.
 * This is to account for clicking inside the button in a payments block, for example.
 * @returns {boolean} Has the user selected a payments block (or a direct descendant) at least once?
 */
const useHasSelectedPaymentBlockOnce = () => {
	const [ hasSelectedPaymentsOnce, setHasSelectedPaymentsOnce ] = useState( false );

	// Get the name of the currently selected block
	const selectedBlockName = useSelect( ( select ) => {
		// Special case: We know we're returning true, so we don't need to find block names.
		if ( hasSelectedPaymentsOnce ) {
			return '';
		}

		const selectedBlock = select( 'core/block-editor' ).getSelectedBlock();
		return selectedBlock?.name ?? '';
	} );

	// Get the name of the currently selected block's direct parent, if one exists
	const parentSelectedBlockName = useSelect( ( select ) => {
		// Special case: We know we're returning true, so we don't need to find block names.
		if ( hasSelectedPaymentsOnce ) {
			return '';
		}

		const selectedBlock = select( 'core/block-editor' ).getSelectedBlock();
		if ( selectedBlock?.clientId ) {
			const parentIds = select( 'core/block-editor' ).getBlockParents( selectedBlock?.clientId );
			if ( parentIds && parentIds.length ) {
				const parent = select( 'core/block-editor' ).getBlock( parentIds[ parentIds.length - 1 ] );
				return parent?.name ?? '';
			}
		}
		return '';
	} );

	// On selection change, set hasSelectedPaymentsOnce=true if block name or parent's block name contains 'payments'
	useEffect( () => {
		if (
			! hasSelectedPaymentsOnce &&
			( selectedBlockName.includes( 'payments' ) || parentSelectedBlockName.includes( 'payments' ) )
		) {
			setHasSelectedPaymentsOnce( true );
		}
	}, [
		selectedBlockName,
		parentSelectedBlockName,
		hasSelectedPaymentsOnce,
		setHasSelectedPaymentsOnce,
	] );

	return hasSelectedPaymentsOnce;
};
export default useHasSelectedPaymentBlockOnce;
