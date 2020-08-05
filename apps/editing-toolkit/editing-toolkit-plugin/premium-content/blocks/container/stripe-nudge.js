/**
 * WordPress dependencies
 */
import { Button, Dashicon } from '@wordpress/components';
import { Warning } from '@wordpress/block-editor';
import { compose } from '@wordpress/compose';
import { __ } from '@wordpress/i18n';
import { withDispatch } from '@wordpress/data';

/**
 * @typedef { import('react').MouseEvent<HTMLElement> } MouseEvent
 *
 * @typedef {object} Props
 * @property { (event: MouseEvent) => void } autosaveAndRedirect
 * @property { string } stripeConnectUrl
 * @property { () => void } onClick
 * @param { Props } props
 */
export const StripeNudge = ( { autosaveAndRedirect, stripeConnectUrl } ) => (
	<Warning
		actions={
			// Use href to determine whether or not to display the Upgrade button.
			stripeConnectUrl && [
				<Button
					key="connect"
					href={ stripeConnectUrl } // Only for server-side rendering, since onClick doesn't work there.
					onClick={ autosaveAndRedirect }
					target="_top"
					isDefault
					className="premium-content-block-nudge__button stripe-nudge__button"
				>
					{ __( 'Connect', 'full-site-editing' ) }
				</Button>,
			]
		}
		className="premium-content-block-nudge"
	>
		<span className="premium-content-block-nudge__info">
			{ <Dashicon icon="star-filled" /> }
			<span className="premium-content-block-nudge__text-container">
				<span className="premium-content-block-nudge__title">
					{ __( 'Connect to Stripe to use this block on your site', 'full-site-editing' ) }
				</span>
				<span className="premium-content-block-nudge__message">
					{ __(
						'This block will be hidden from your visitors until you connect to Stripe.',
						'full-site-editing'
					) }
				</span>
			</span>
		</span>
	</Warning>
);

/**
 * Exports a component with the same props as StripeNudge but omits autosaveAndRedirect
 * due to it being provided here.
 *
 * @type { import('react').ComponentType<Omit<Props, 'autosaveAndRedirect'>> }
 */
export default compose( [
	withDispatch(
		/**
		 * Complicated to define the valid type with JSDoc
		 *
		 * @param dispatch
		 * @param root0
		 * @param root0.stripeConnectUrl
		 */
		// @ts-ignore
		( dispatch, { stripeConnectUrl } ) => ( {
			/**
			 * @param { MouseEvent } event
			 * @returns { Promise<void> } When completed
			 */
			autosaveAndRedirect: async ( event ) => {
				event.preventDefault(); // Don't follow the href before autosaving
				await dispatch( 'core/editor' ).savePost();
				// Using window.top to escape from the editor iframe on WordPress.com
				window.top.location.href = stripeConnectUrl;
			},
		} )
	),
] )( StripeNudge );
