import { __, sprintf } from '@wordpress/i18n';
import React from 'react';
import * as ReactDOM from 'react-dom/client';
import { DetailedPayment } from 'calypso/data/promote-post/use-promote-post-payment-details-query';
import { Payment } from 'calypso/data/promote-post/use-promote-post-payments-query';
import { Receipt } from './Receipt';
import './style.scss';

/**
 * This is the print version of the receipt; it basically uses the same component that's regular user sees
 * It injects that component into an iframe, and then we trigger the print dialogue to run on the iframe.
 * By moving only the content of the receipt into the iframe, we don't need to worry about the rest of the page changing over time.
 *
 */
const PrintableReceipt = ( {
	payment,
	billingDetails,
	sites,
	onRenderComplete,
}: {
	payment: Payment | DetailedPayment;
	billingDetails: string;
	sites: Record< number, any >;
	onRenderComplete: () => void;
} ) => {
	// Use React's useEffect to signal when rendering is complete
	React.useEffect( () => {
		// This will run after the component has rendered
		onRenderComplete();
	}, [ onRenderComplete ] );

	return (
		<div className="payment-receipt">
			<Receipt payment={ payment } billingDetails={ billingDetails } isPrintView sites={ sites } />
		</div>
	);
};

/**
 * Utility function to handle printing of a receipt
 */
export const printReceipt = (
	payment: Payment | DetailedPayment,
	billingDetails: string,
	sites: Record< number, any >
) => {
	const printReceiptStyles = `
		body{margin:0;background:white;font-family:system-ui,sans-serif}
		.print-iframe{display:none}
		.payment-receipt{color:#1e1e1e;padding:24px 0;margin:20px auto 0}
		.payment-receipt__section{margin-bottom:24px}
		.payment-receipt__section-title{font-size:1.25rem;margin-bottom:16px;padding-bottom:8px;border-bottom:2px solid #f0f0f0}
		.payment-receipt__row{display:flex;justify-content:space-between;margin-bottom:8px}
		.payment-receipt__header{display:flex;justify-content:space-between;margin-bottom:48px;align-items:flex-start}
		.payment-receipt__organization-logo{width:65px;height:65px;flex-shrink:0}
		.payment-receipt__organization-logo svg{width:100%;height:auto}
		.payment-receipt__organization-details{margin-left:16px;flex-grow:1}
		.payment-receipt__organization-name{font-weight:bold;font-size:1rem;margin-bottom:4px}
		.payment-receipt__label{font-weight:bold;margin-right:16px}
		.payment-receipt__value{color:#646970;font-size:0.875rem}
		.payment-receipt__value-bold{font-weight:bold}
		.payment-receipt__secondary-text{color:#646970;font-size:0.875rem}
		.payment-receipt__date{text-align:right}
		.payment-receipt__billing-details{margin-top:24px}
		.payment-receipt__billing-text{line-height:1.5;white-space:pre-line;margin-top:8px}
		.payment-receipt__payment-details{margin-bottom:16px}
		.payment-receipt__payment-method{padding-bottom:16px;border-bottom:1px solid #f0f0f0;margin-bottom:16px}
		.payment-receipt__payment-amounts{margin-top:16px}
		.payment-receipt__list-item{display:flex;justify-content:space-between;margin-bottom:16px;padding-bottom:16px;border-bottom:1px solid #f0f0f0}
		.payment-receipt__list-item:last-child{border-bottom:none}
		.payment-receipt__item-content{flex-grow:1}
		.components-spinner{display:inline-block;width:18px;height:18px;margin:0 8px 0 0;background-color:#949494;opacity:0.7;border-radius:100%}
		.payment-receipt__inline-loading{display:flex;align-items:center;margin-bottom:16px}
		.wpcom-print-logo{max-width:100%;max-height:100%}
		.payment-receipt__print{display:none}
		.payment-receipt__domain-group{margin-bottom:16px}
		.payment-receipt__domain-group:not(:first-child){margin-top:16px;padding-top:8px}
		.payment-receipt__domain-header{margin-bottom:16px;padding-bottom:4px;border-bottom:1px solid #e0e0e0}
		.payment-receipt__domain-name{font-size:15px;font-weight:600;color:#3c4043;margin:0}
		.payment-receipt__campaign-item{margin-bottom:8px}
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
				<style>${ printReceiptStyles }</style>
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
								sites={ sites }
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
