/**
 * WordPress dependencies
 */
import { InnerBlocks } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';
import { useEffect } from '@wordpress/element';
import { compose } from '@wordpress/compose';
import { withDispatch, withSelect } from '@wordpress/data';
import {
	__experimentalAlignmentHookSettingsProvider,
	__experimentalBlock,
} from '@wordpress/block-editor';

/**
 * Internal dependencies
 */
import Context from '../container/context';
import SubmitButtons from './submit-buttons';

const supportsDecoupledBlocks = __experimentalAlignmentHookSettingsProvider && __experimentalBlock;

/**
 * Block edit function
 *
 * @typedef { import('./').Attributes } Attributes
 * @typedef { object } Props
 * @property { boolean } isSelected
 * @property { string } className
 * @property { string } clientId
 * @property { string } containerClientId
 * @property { Attributes } attributes
 * @property { Function } setAttributes
 * @property { Function } selectContainerBlock
 *
 * @param { Props } props Properties
 */
function Edit( props ) {
	const {
		selectContainerBlock,
		subscribeButtonText,
		loginButtonText,
		backgroundButtonColor,
		textButtonColor,
		customBackgroundButtonColor,
		customTextButtonColor,
		setAttributes,
	} = props;

	useEffect( () => {
		// Selects the container block on mount.
		//
		// Execution delayed with setTimeout to ensure it runs after any block auto-selection performed by inner blocks
		// (such as the Recurring Payments block). @see https://github.com/Automattic/wp-calypso/issues/43450
		setTimeout( selectContainerBlock, 0 );
	}, [] );

	const buttons = (
		<SubmitButtons
			{ ...{
				attributes: {
					subscribeButtonText,
					loginButtonText,
					backgroundButtonColor,
					textButtonColor,
					customBackgroundButtonColor,
					customTextButtonColor,
				},
				setAttributes,
			} }
		/>
	);
	const template = [
		[ 'core/heading', { content: __( 'Subscribe to get access', 'full-site-editing' ), level: 3 } ],
		[
			'core/paragraph',
			{
				content: __( 'Read more of this content when you subscribe today.', 'full-site-editing' ),
			},
		],
	];

	if ( supportsDecoupledBlocks ) {
		template.push( [ 'premium-content/buttons' ] );
	}
	return (
		<Context.Consumer>
			{ ( { selectedTab, stripeNudge } ) => (
				/** @see https://github.com/evcohen/eslint-plugin-jsx-a11y/blob/HEAD/docs/rules/no-static-element-interactions.md#case-the-event-handler-is-only-being-used-to-capture-bubbled-events */
				// eslint-disable-next-line
				<div hidden={ selectedTab.id === 'premium' } className={ selectedTab.className }>
					{ stripeNudge }
					<InnerBlocks templateLock={ false } template={ template } />
					{ ! supportsDecoupledBlocks && buttons }
				</div>
			) }
		</Context.Consumer>
	);
}

export default compose( [
	withSelect( ( select, props ) => {
		const { getBlockHierarchyRootClientId } = select( 'core/block-editor' );
		return {
			// @ts-ignore difficult to type with JSDoc
			containerClientId: getBlockHierarchyRootClientId( props.clientId ),
		};
	} ),
	withDispatch( ( dispatch, props ) => {
		const { selectBlock } = dispatch( 'core/block-editor' );
		return {
			selectContainerBlock() {
				// @ts-ignore difficult to type with JSDoc
				selectBlock( props.containerClientId );
			},
		};
	} ),
] )( Edit );
