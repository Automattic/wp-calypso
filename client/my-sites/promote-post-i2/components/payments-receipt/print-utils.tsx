import { __, sprintf } from '@wordpress/i18n';
import React from 'react';
import * as ReactDOM from 'react-dom/client';
import { DetailedPayment } from 'calypso/data/promote-post/use-promote-post-payment-details-query';
import { Payment } from 'calypso/data/promote-post/use-promote-post-payments-query';
import { Receipt } from './Receipt';

function extractCssFromStylesheet() {
	// Extract styles safely to inject into the iframe.
	return Array.from( document.styleSheets )
		.map( ( styleSheet ) => {
			try {
				return Array.from( styleSheet.cssRules || [] )
					.map( ( rule ) => rule.cssText )
					.join( '\n' );
			} catch {
				return '';
			}
		} )
		.filter( Boolean )
		.join( '\n' );
}

// This is a new component that handles rendering and printing
const PrintableReceipt = ( {
	payment,
	billingDetails,
	onRenderComplete,
}: {
	payment: Payment | DetailedPayment;
	billingDetails: string;
	onRenderComplete: () => void;
} ) => {
	// Use React's useEffect to signal when rendering is complete
	React.useEffect( () => {
		// This will run after the component has rendered
		onRenderComplete();
	}, [ onRenderComplete ] );

	return (
		<div className="payment-receipt">
			<Receipt payment={ payment } billingDetails={ billingDetails } isPrintView />
		</div>
	);
};

/**
 * Utility function to handle printing of a receipt
 */
export const printReceipt = ( payment: Payment | DetailedPayment, billingDetails: string ) => {
	const styles = extractCssFromStylesheet();

	// Minimal required styles
	const printWrapperStyles = `
			body { margin: 0; padding: 20px; background: white; font-family: system-ui, sans-serif; }
			.payment-receipt { margin: 0 auto; box-shadow: none; }
			@media print { body { padding: 0; } .payment-receipt { max-width: none; } }
			.print-iframe { display: none; }
		`;

	// Create a hidden iframe for printing
	const iframe = document.createElement( 'iframe' );
	iframe.className = 'print-iframe';
	iframe.style.position = 'absolute';
	iframe.style.width = '0';
	iframe.style.height = '0';
	iframe.style.border = '0';
	document.body.appendChild( iframe );

	// Write the content to the iframe
	const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
	if ( iframeDoc ) {
		iframeDoc.open();
		iframeDoc.write( `
			<!DOCTYPE html>
			<html lang="en">
			<head>
				<title>${ sprintf(
					/* translators: %d is the payment ID */
					__( 'WordPress Blaze Payment Receipt - ID %d' ),
					payment.id
				) }</title>
				<meta charset="UTF-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<style>${ styles }</style>
				<style>${ printWrapperStyles }</style>
			</head>
			<body>
				<div id="print-container" class="payment-receipt"></div>
			</body>
			</html>
		` );
		iframeDoc.close();

		// Helper to remove the iframe after printing
		const cleanupIframe = () => {
			if ( document.body.contains( iframe ) ) {
				document.body.removeChild( iframe );
			}
		};

		// Wait for the iframe to load and then print
		iframe.onload = () => {
			try {
				if ( iframe.contentWindow ) {
					// Get the container element
					const printContainer = iframeDoc.getElementById( 'print-container' );
					if ( printContainer ) {
						// Handles the print dialogue and cleans up after.
						const handleRenderComplete = () => {
							// Add an event listener for print completion
							iframe.contentWindow?.addEventListener( 'afterprint', cleanupIframe );

							// Focus and trigger print
							iframe.contentWindow?.focus();
							iframe.contentWindow?.print();
						};

						// Render the receipt
						const root = ReactDOM.createRoot( printContainer );
						root.render(
							<PrintableReceipt
								payment={ payment }
								billingDetails={ billingDetails }
								onRenderComplete={ handleRenderComplete }
							/>
						);
					}
				}
			} catch ( e ) {
				// If anything fails, still cleanup
				cleanupIframe();
			}
		};
	}
};
