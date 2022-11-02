import { useBlockProps } from '@wordpress/block-editor';
import { SupportPageBlockAttributes } from './block';
import { SupportPageEmbed } from './support-page-embed';

export const Save = ( props: { attributes: SupportPageBlockAttributes } ) => {
	const blockProps = useBlockProps.save();
	const { attributes } = props;

	return (
		<div { ...blockProps }>
			<SupportPageEmbed attributes={ attributes } />
		</div>
	);
};
