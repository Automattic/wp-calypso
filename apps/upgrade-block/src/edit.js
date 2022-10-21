import { useBlockProps } from '@wordpress/block-editor';

/**
 * The edit function describes the structure of your block in the context of the
 * editor. This represents what the editor will render when the block is used.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-edit-save/#edit
 * @returns {import("@wordpress/element").WPElement} Element to render.
 */
export default function Edit() {
	const blockProps = useBlockProps();
	return <div { ...blockProps }>Upgrade plans placeholder</div>;
}
