/**
 * WordPress dependencies
 */
import { InnerBlocks } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';
import { useEffect } from '@wordpress/element';
import { createBlock } from '@wordpress/blocks';
import { compose } from '@wordpress/compose';
import { withDispatch, withSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import Context from '../container/context';

function getButtonBlocks( block ) {
	let blocks = [];
	if ( block.innerBlocks && block.innerBlocks.length > 0 ) {
		block.innerBlocks.forEach( ( b ) => {
			if ( b.name === 'premium-content/button' ) {
				blocks.push( b );
			}
			if ( b.innerBlocks && b.innerBlocks.length > 0 ) {
				blocks = blocks.concat( getButtonBlocks( b ) );
			}
		} );
	}
	return blocks;
}

/**
 * Block edit function
 *
 * @typedef { import('./').Attributes } Attributes
 * @typedef {object} Props
 * @property { boolean } isSelected
 * @property { string } className
 * @property { string } clientId
 * @property { string } containerClientId
 * @property { Attributes } attributes
 * @property { (attributes: Partial<Attributes>) => void } setAttributes
 * @property { () => void } selectBlock
 *
 * @param { Props } props
 */
function Edit( props ) {
	useEffect( () => {
		props.selectBlock();
		props.insertButtonBlocksIfMissing();
		setBlockContext();
	}, [ props.context ] );

	function setBlockContext() {
		const { context } = props;
		props.setAttributes( context );
	}

	return (
		<Context.Consumer>
			{ ( { selectedTab, stripeNudge } ) => (
				/** @see https://github.com/evcohen/eslint-plugin-jsx-a11y/blob/master/docs/rules/no-static-element-interactions.md#case-the-event-handler-is-only-being-used-to-capture-bubbled-events */
				// eslint-disable-next-line
				<div hidden={ selectedTab.id === 'premium' } className={ selectedTab.className }>
					{ stripeNudge }
					<InnerBlocks
						templateLock={ false }
						template={ [
							[
								'core/heading',
								{ content: __( 'Subscribe to get access', 'full-site-editing' ), level: 3 },
							],
							[
								'core/paragraph',
								{
									content: __(
										'Read more of this content when you subscribe today.',
										'full-site-editing'
									),
								},
							],
							[
								'core/columns',
								{},
								[
									[
										'premium-content/button',
										{
											buttonType: 'subscribe',
											buttonText: __( 'Subscribe', 'premium-content' ),
										},
									],
									[ 'premium-content/button' ],
								],
							],
						] }
					/>
				</div>
			) }
		</Context.Consumer>
	);
}

export default compose( [
	withSelect( ( select, props ) => {
		const blockEditor = select( 'core/block-editor' );
		return {
			// @ts-ignore difficult to type with JSDoc
			containerClientId: blockEditor.getBlockHierarchyRootClientId( props.clientId ),
			block: blockEditor.getBlocksByClientId( props.clientId )[ 0 ],
		};
	} ),
	withDispatch( ( dispatch, props ) => {
		const blockEditor = dispatch( 'core/block-editor' );
		return {
			selectBlock() {
				// @ts-ignore difficult to type with JSDoc
				blockEditor.selectBlock( props.containerClientId );
			},
			insertButtonBlocksIfMissing() {
				const buttonBlocks = getButtonBlocks( props.block );

				if ( buttonBlocks.length === 0 ) {
					const { attributes } = props;

					const loginButtonBlock = createBlock( 'premium-content/button', {
						buttonType: 'login',
						buttonText: attributes.loginButtonText,
						buttonClasses: attributes.buttonClasses,
						backgroundButtonColor: attributes.backgroundButtonColor,
						textButtonColor: attributes.textButtonColor,
						customBackgroundButtonColor: attributes.customBackgroundButtonColor,
						customTextButtonColor: attributes.customTextButtonColor,
					} );
					const subscribeButtonBlock = createBlock( 'premium-content/button', {
						buttonType: 'subscribe',
						buttonText: attributes.subscribeButtonText,
						buttonClasses: attributes.buttonClasses,
						backgroundButtonColor: attributes.backgroundButtonColor,
						textButtonColor: attributes.textButtonColor,
						customBackgroundButtonColor: attributes.customBackgroundButtonColor,
						customTextButtonColor: attributes.customTextButtonColor,
					} );
					const columnBlock = createBlock( 'core/columns', {}, [
						loginButtonBlock,
						subscribeButtonBlock,
					] );
					blockEditor.insertBlocks( columnBlock, -1, props.clientId );
				}
			},
		};
	} ),
] )( Edit, getButtonBlocks );
