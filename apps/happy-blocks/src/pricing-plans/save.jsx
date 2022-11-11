import { useBlockProps } from '@wordpress/block-editor';

export const Save = () => {
	const blockProps = useBlockProps.save();
	return <div { ...blockProps }>Upgrade plans placeholder</div>;
};
