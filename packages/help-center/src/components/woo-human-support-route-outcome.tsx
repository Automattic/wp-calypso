import { Button, ExternalLink } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';

const WOO_FORUMS_URL = 'https://wordpress.org/support/plugin/woocommerce/';
const WOO_DOCS_URL = 'https://woocommerce.com/documentation/woocommerce/';

/** Routes the Help Center answers itself, rather than handing the request to a person. */
export type WooHumanSupportOutcome =
	| { route: 'forums' | 'ai-reply-then-forums' }
	| { route: 'link-out'; productName: string; url: string };

export function WooHumanSupportRouteOutcome( {
	outcome,
	onDone,
}: {
	outcome: WooHumanSupportOutcome;
	onDone: () => void;
} ) {
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
								'We support WooCommerce, our free core plugin, in public spaces: our <docs>docs</docs> and <forums>forums</forums>. If the answer above doesn’t help, ask in the forums.',
								__i18n_text_domain__
							),
							links
						) }
					</p>
				</>
			) }
			<div className="help-center-woo-routing-step__actions">
				<Button __next40pxDefaultSize variant="tertiary" onClick={ onDone }>
					{ __( 'Done', __i18n_text_domain__ ) }
				</Button>
				{ outcome.route === 'link-out' && (
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
				) }
			</div>
		</>
	);
}
