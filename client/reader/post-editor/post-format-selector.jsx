import { useState } from '@wordpress/element';
import { Icon, image, link, quote, paragraph, video } from '@wordpress/icons';
import { translate } from 'i18n-calypso';
import SegmentedControl from 'calypso/components/segmented-control';

export default function PostFormatSelector() {
	const [ format, setFormat ] = useState( 'text' );

	function handleFormatClick( value ) {
		setFormat( value );
	}

	return (
		<SegmentedControl>
			<SegmentedControl.Item
				onClick={ () => handleFormatClick( 'text' ) }
				selected={ format === 'text' }
				value="text"
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
				onClick={ () => handleFormatClick( 'link' ) }
				selected={ format === 'link' }
				value="link"
			>
				<Icon className="segmented-control__icon" icon={ link } size={ 18 } />
				<span className="segmented-control__label">{ translate( 'Link' ) }</span>
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
