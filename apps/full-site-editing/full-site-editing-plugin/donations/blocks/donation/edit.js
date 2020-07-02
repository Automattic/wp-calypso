/**
 * WordPress dependencies
 */
import { __experimentalBlock as Block, InnerBlocks } from '@wordpress/block-editor';
import { useDispatch, useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import Context from '../donations/context';
import { useEffect } from '@wordpress/element';

const Edit = ( { attributes, clientId, context } ) => {
	const { interval } = attributes;
	const currency = context[ 'donations/currency' ];
	const showCustom = context[ 'donations/showCustom' ];

	const donationsBlockClientId = useSelect(
		( select ) => select( 'core/block-editor' ).getBlockHierarchyRootClientId( clientId ),
		[ clientId ]
	);
	const { selectBlock } = useDispatch( 'core/block-editor' );
	// Auto-selects the parent donations blocks on mount.
	useEffect( () => {
		if ( donationsBlockClientId ) {
			selectBlock( donationsBlockClientId );
		}
	}, [ donationsBlockClientId ] );

	const headings = {
		'one-time': __( 'Make a one-time donation', 'full-site-editing' ),
		'1 month': __( 'Make a monthly donation', 'full-site-editing' ),
		'1 year': __( 'Make a yearly donation', 'full-site-editing' ),
	};

	const buttons = {
		'one-time': __( 'Donate', 'full-site-editing' ),
		'1 month': __( 'Donate monthly', 'full-site-editing' ),
		'1 year': __( 'Donate yearly', 'full-site-editing' ),
	};

	const template = [
		[ 'core/heading', { content: headings[ interval ], level: 3 } ],
		[
			'core/paragraph',
			{ content: __( 'Choose an amount', 'full-site-editing' ) + ` (${ currency })` },
		],
		...( showCustom
			? [ [ 'core/paragraph', { content: __( 'Or enter a custom amount', 'full-site-editing' ) } ] ]
			: [] ),
		[
			'core/paragraph',
			{ content: __( 'Your contribution is appreciated.', 'full-site-editing' ) },
		],
		[ 'core/button', { text: buttons[ interval ] } ],
	];

	return (
		<Context.Consumer>
			{ ( { activeTab } ) => (
				<Block.div hidden={ activeTab !== interval }>
					<InnerBlocks templateLock={ 'insert' } template={ template } />
				</Block.div>
			) }
		</Context.Consumer>
	);
};

export default Edit;
