/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { __experimentalBlock as Block, InnerBlocks } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import intervalClassNames from './interval-class-names';

const Edit = ( { attributes, context } ) => {
	const { interval } = attributes;
	const currency = context[ 'donations/currency' ];
	const showCustom = context[ 'donations/showCustom' ];

	const headers = {
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
		[ 'core/heading', { content: headers[ interval ], level: 3 } ],
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
		<Block.div className={ classnames( 'wp-block-a8c-donation', intervalClassNames[ interval ] ) }>
			<InnerBlocks templateLock={ false } template={ template } />
		</Block.div>
	);
};

export default Edit;
