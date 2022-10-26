import { useBlockProps } from '@wordpress/block-editor';
import './editor.scss';

export const Save = () => {
	const blockProps = useBlockProps.save();
	return <div { ...blockProps }>Upgrade plans placeholder</div>;
};
