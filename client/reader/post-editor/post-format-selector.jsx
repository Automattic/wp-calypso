import { createBlock, switchToBlockType } from '@wordpress/blocks';
import { dispatch, select } from '@wordpress/data';
import { useState } from '@wordpress/element';
import { Icon, image, quote, paragraph, video } from '@wordpress/icons';
import { translate } from 'i18n-calypso';
import SegmentedControl from 'calypso/components/segmented-control';

export default function PostFormatSelector() {
	const [ format, setFormat ] = useState( 'paragraph' );

	function handleFormatClick( value ) {
		const { getBlocks } = select( 'core/block-editor' );
		const { insertBlocks, removeBlock, replaceBlock, selectBlock } =
			dispatch( 'core/block-editor' );
		let blocks = getBlocks();
		let newBlocks = null;
		const hasBlocks = blocks && blocks.length > 0;
		const toBlockName = `core/${ value }`;
		const fromBlockName = hasBlocks ? blocks[ 0 ].name : null;

		setFormat( value );

		if ( ! hasBlocks ) {
			newBlocks = [ createBlock( toBlockName ) ];
			insertBlocks( newBlocks );
			selectBlock( newBlocks[ 0 ].clientId );
			return;
		} else if ( toBlockName === fromBlockName ) {
			return;
		}

		switch ( `${ fromBlockName }->${ toBlockName }` ) {
			case 'core/paragraph->core/quote':
				newBlocks = switchToBlockType( blocks[ 0 ], toBlockName );
				replaceBlock( blocks[ 0 ].clientId, newBlocks );
				break;
			case 'core/paragraph->core/image':
			case 'core/paragraph->core/video':
				newBlocks = [ createBlock( toBlockName ) ];
				insertBlocks( newBlocks, 0 );
				break;
			case 'core/quote->core/paragraph':
				// "Unwrap" the quote block.
				newBlocks = switchToBlockType( blocks[ 0 ], '*' );
				replaceBlock( blocks[ 0 ].clientId, newBlocks );
				break;
			case 'core/quote->core/image':
			case 'core/quote->core/video':
				newBlocks = switchToBlockType( blocks[ 0 ], '*' );
				replaceBlock( blocks[ 0 ].clientId, newBlocks );
				newBlocks = [ createBlock( toBlockName ) ];
				insertBlocks( newBlocks, 0 );
				break;
			case 'core/image->core/paragraph':
			case 'core/image->core/quote':
			case 'core/image->core/video':
			case 'core/video->core/paragraph':
			case 'core/video->core/image':
			case 'core/video->core/quote':
				removeBlock( blocks[ 0 ].clientId );
				newBlocks = [ createBlock( toBlockName ) ];
				blocks = getBlocks();
				if ( newBlocks[ 0 ].name !== blocks[ 0 ].name ) {
					insertBlocks( newBlocks, 0 );
				}
				break;
		}

		blocks = getBlocks();
		selectBlock( blocks[ 0 ].clientId );
	}

	return (
		<SegmentedControl>
			<SegmentedControl.Item
				onClick={ () => handleFormatClick( 'paragraph' ) }
				selected={ format === 'paragraph' }
				value="paragraph"
			>
				<Icon className="segmented-control__icon" icon={ paragraph } size={ 18 } />
				<span className="segmented-control__label">{ translate( 'Text' ) }</span>
			</SegmentedControl.Item>

			<SegmentedControl.Item
				onClick={ () => handleFormatClick( 'image' ) }
				selected={ format === 'image' }
				value="image"
			>
				<Icon className="segmented-control__icon" icon={ image } size={ 18 } />
				<span className="segmented-control__label">{ translate( 'Image' ) }</span>
			</SegmentedControl.Item>

			<SegmentedControl.Item
				onClick={ () => handleFormatClick( 'quote' ) }
				selected={ format === 'quote' }
				value="quote"
			>
				<Icon className="segmented-control__icon" icon={ quote } size={ 18 } />
				<span className="segmented-control__label">{ translate( 'Quote' ) }</span>
			</SegmentedControl.Item>

			<SegmentedControl.Item
				onClick={ () => handleFormatClick( 'video' ) }
				selected={ format === 'video' }
				value="video"
			>
				<Icon className="segmented-control__icon" icon={ video } size={ 18 } />
				<span className="segmented-control__label">{ translate( 'Video' ) }</span>
			</SegmentedControl.Item>
		</SegmentedControl>
	);
}
