import { Button, ExternalLink, Spinner } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';

const WOO_FORUMS_URL = 'https://wordpress.org/support/plugin/woocommerce/';
const WOO_DOCS_URL = 'https://woocommerce.com/documentation/woocommerce/';
const WOO_CONTACT_URL = 'https://woocommerce.com/my-account/contact-support/';

/** Routes the Help Center answers itself, rather than handing the request to a person. */
export type WooHumanSupportOutcome =
	| { route: 'forums' | 'ai-reply-then-forums' | 'email-form' }
	| { route: 'link-out'; productName: string; url: string };

export type WooTicketStatus = 'confirm' | 'sending' | 'sent' | 'failed';

/**
 * A ticket the Help Center files for the merchant. A vendor's ticket asks first, since the vendor
 * gets the conversation and the store's address by email. Like the other cards, it has no Done.
 */
export function WooHumanSupportTicket( {
	status,
	vendorName,
	errorMessage,
	onSend,
	onCancel,
}: {
	status: WooTicketStatus;
	/** The product's name when its vendor, rather than WooCommerce, gets the ticket. */
	vendorName: string | null;
	errorMessage: string | null;
	/** Sends the ticket after the vendor question, or again after a failure. */
	onSend: () => void;
	onCancel: () => void;
} ) {
	if ( status === 'confirm' && vendorName ) {
		return (
			<>
				<h3 className="help-center-woo-routing-step__title">
					{ sprintf(
						/* translators: %s: the name of a product its developer supports */
						__( 'Send your request to the %s team?', __i18n_text_domain__ ),
						vendorName
					) }
				</h3>
				<p className="help-center-woo-routing-step__intro">
					{ sprintf(
						/* translators: %s: the name of a product its developer supports */
						__(
							"%s is supported by its developer. They'll get this conversation and your store address by email.",
							__i18n_text_domain__
						),
						vendorName
					) }
				</p>
				<div className="help-center-woo-routing-step__actions">
					<Button __next40pxDefaultSize variant="tertiary" onClick={ onCancel }>
						{ __( 'Cancel', __i18n_text_domain__ ) }
					</Button>
					<Button __next40pxDefaultSize variant="primary" onClick={ onSend }>
						{ __( 'Send', __i18n_text_domain__ ) }
					</Button>
				</div>
			</>
		);
	}

	if ( status === 'sent' ) {
		return (
			<>
				<h3 className="help-center-woo-routing-step__title">
					{ __( 'Request sent', __i18n_text_domain__ ) }
				</h3>
				<p className="help-center-woo-routing-step__intro">
					{ vendorName
						? sprintf(
								/* translators: %s: the name of a product its developer supports */
								__( 'The %s team will reply to you by email.', __i18n_text_domain__ ),
								vendorName
							)
						: __( 'A Happiness Engineer will reply to you by email.', __i18n_text_domain__ ) }
				</p>
			</>
		);
	}

	if ( status === 'failed' ) {
		return (
			<>
				<h3 className="help-center-woo-routing-step__title">
					{ __( "We couldn't send your request", __i18n_text_domain__ ) }
				</h3>
				{ errorMessage && (
					<p className="help-center-woo-routing-step__message">{ errorMessage }</p>
				) }
				<p className="help-center-woo-routing-step__intro">
					{ createInterpolateElement(
						__( 'Try again, or use our <form>support form</form>.', __i18n_text_domain__ ),
						{
							// @ts-expect-error Children must be passed to External link. This is done by createInterpolateElement, but the types don't see that.
							form: <ExternalLink href={ WOO_CONTACT_URL } />,
						}
					) }
				</p>
				<div className="help-center-woo-routing-step__actions">
					<Button __next40pxDefaultSize variant="primary" onClick={ onSend }>
						{ __( 'Try again', __i18n_text_domain__ ) }
					</Button>
				</div>
			</>
		);
	}

	return (
		<>
			<p className="help-center-woo-routing-step__message">
				{ __( 'Sending your request…', __i18n_text_domain__ ) }
			</p>
			<Spinner className="help-center-woo-routing-step__spinner" />
		</>
	);
}

/**
 * The card is the answer, so there's no Done: that would put the chat's "connect me" buttons back
 * for the same request. It stays until the merchant writes to the bot again.
 */
export function WooHumanSupportRouteOutcome( { outcome }: { outcome: WooHumanSupportOutcome } ) {
	const links = {
		// @ts-expect-error Children must be passed to External link. This is done by createInterpolateElement, but the types don't see that.
		docs: <ExternalLink href={ WOO_DOCS_URL } />,
		// @ts-expect-error Children must be passed to External link. This is done by createInterpolateElement, but the types don't see that.
		forums: <ExternalLink href={ WOO_FORUMS_URL } />,
	};

	return (
		<>
			{ outcome.route === 'link-out' && (
				<>
					<h3 className="help-center-woo-routing-step__title">
						{ sprintf(
							/* translators: %s: the name of a product that has its own support team */
							__( '%s has its own support', __i18n_text_domain__ ),
							outcome.productName
						) }
					</h3>
					<p className="help-center-woo-routing-step__intro">
						{ sprintf(
							/* translators: %s: the name of a product that has its own support team */
							__(
								'Click the following button to submit a support request for %s.',
								__i18n_text_domain__
							),
							outcome.productName
						) }
					</p>
				</>
			) }
			{ outcome.route === 'forums' && (
				<>
					<h3 className="help-center-woo-routing-step__title">
						{ __( 'Ask the WooCommerce community', __i18n_text_domain__ ) }
					</h3>
					<p className="help-center-woo-routing-step__intro">
						{ createInterpolateElement(
							__(
								'The best place for this is our <forums>community forums</forums>. You can also find guides in our <docs>docs</docs>.',
								__i18n_text_domain__
							),
							links
						) }
					</p>
				</>
			) }
			{ outcome.route === 'ai-reply-then-forums' && (
				<>
					<h3 className="help-center-woo-routing-step__title">
						{ __( 'Ask the WooCommerce community', __i18n_text_domain__ ) }
					</h3>
					<p className="help-center-woo-routing-step__intro">
						{ createInterpolateElement(
							__(
								'We support WooCommerce, our free core plugin, in public spaces: our <docs>docs</docs> and <forums>forums</forums>. If you still need help, ask in the forums.',
								__i18n_text_domain__
							),
							links
						) }
					</p>
				</>
			) }
			{ outcome.route === 'email-form' && (
				<>
					<h3 className="help-center-woo-routing-step__title">
						{ __( 'Contact us by email', __i18n_text_domain__ ) }
					</h3>
					<p className="help-center-woo-routing-step__intro">
						{ __(
							"We'll help you with this by email. Send us a request with our contact form, from an email address you can reach.",
							__i18n_text_domain__
						) }
					</p>
					<div className="help-center-woo-routing-step__actions">
						<Button
							__next40pxDefaultSize
							variant="primary"
							href={ WOO_CONTACT_URL }
							target="_blank"
							rel="noopener noreferrer"
						>
							{ __( 'Contact us', __i18n_text_domain__ ) }
						</Button>
					</div>
				</>
			) }
			{ outcome.route === 'link-out' && (
				<div className="help-center-woo-routing-step__actions">
					<Button
						__next40pxDefaultSize
						variant="primary"
						href={ outcome.url }
						target="_blank"
						rel="noopener noreferrer"
					>
						{ sprintf(
							/* translators: %s: the name of a product that has its own support team */
							__( 'Contact %s Support', __i18n_text_domain__ ),
							outcome.productName
						) }
					</Button>
				</div>
			) }
		</>
	);
}
