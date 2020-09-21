/**
 * WordPress dependencies
 */
import { InnerBlocks } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';
import { compose } from '@wordpress/compose';
import { withSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import Context from '../container/context';

/**
 * Block edit function
 *
 * @typedef { object } Props
 * @property { string } clientId
 * @property { boolean } hasInnerBlocks
 *
 * @param { Props } props Properties
 */
const Edit = ( props ) => (
	<Context.Consumer>
		{ ( { selectedTab, stripeNudge } ) => (
			/** @see https://github.com/evcohen/eslint-plugin-jsx-a11y/blob/HEAD/docs/rules/no-static-element-interactions.md#case-the-event-handler-is-only-being-used-to-capture-bubbled-events */
			// eslint-disable-next-line
			<div hidden={ selectedTab.id === 'wall' } className={ selectedTab.className }>
				{ stripeNudge }
				<InnerBlocks
					renderAppender={ ! props.hasInnerBlocks && InnerBlocks.ButtonBlockAppender }
					templateLock={ false }
					template={ [
						[
							'core/paragraph',
							{
								placeholder: __(
									'Insert the piece of content you want your visitors to see after they subscribe.',
									'full-site-editing'
								),
							},
						],
					] }
				/>
			</div>
		) }
	</Context.Consumer>
);

export default compose( [
	withSelect( ( select, props ) => {
		return {
			// @ts-ignore difficult to type with JSDoc
			hasInnerBlocks: !! select( 'core/block-editor' ).getBlocksByClientId( props.clientId )[ 0 ]
				.innerBlocks.length,
		};
	} ),
] )( Edit );
