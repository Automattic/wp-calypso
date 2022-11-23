import { useBlockProps } from '@wordpress/block-editor';
import { SupportContentBlockAttributes } from './block';
import { SupportContentEmbed } from './support-content-embed';

/**
 * Convert block attributes to HTML representation for storing in the post content
 */
export const Save = ( props: { attributes: SupportContentBlockAttributes } ) => {
	const blockProps = useBlockProps.save();
	const { attributes } = props;

	return (
		<div { ...blockProps }>
			<SupportContentEmbed attributes={ attributes } clickable />
		</div>
	);
};
