import { __experimentalText as Text, __experimentalVStack as VStack } from '@wordpress/components';
import type { ActivityLogEntry } from '@automattic/api-core';

interface ImagePreviewProps {
	item: ActivityLogEntry;
	multipleImages?: boolean;
}

export function ImagePreview( { item, multipleImages = false }: ImagePreviewProps ) {
	if ( ! item.image?.available ) {
		return null;
	}

	const { image } = item;

	return (
		<VStack>
			<a href={ image.url } target="_blank" rel="noopener noreferrer">
				<img
					src={ image.medium_url }
					alt={ image.name }
					style={ { width: '100%', aspectRatio: '1 / 1', objectFit: 'cover' } }
				/>
			</a>
			{ multipleImages && <Text weight={ 500 }>{ image.name }</Text> }
		</VStack>
	);
}
