/**
 * Sidebar last-created widget — design variant A "preview + insert".
 *
 * Shown when videoStudioStore has a currentVideoUrl + currentAttachmentId
 * and no in-flight render. Primary action is "Insert into post" which
 * inserts a core/video block at the current cursor.
 */
import { createBlock } from '@wordpress/blocks';
import { Button } from '@wordpress/components';
import { dispatch, useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { ImageStudioEntryPoint, store as imageStudioStore } from '../store';
import { store as videoStudioStore } from '../stores/video-studio';

interface BlockEditorActions {
	insertBlocks: ( blocks: unknown ) => Promise< unknown >;
}

export function FeatureClipResult(): JSX.Element | null {
	const currentVideoUrl = useSelect(
		( select ) => select( videoStudioStore ).getCurrentVideoUrl(),
		[]
	);
	const currentAttachmentId = useSelect(
		( select ) => select( videoStudioStore ).getCurrentAttachmentId(),
		[]
	);
	const currentDurationSeconds = useSelect(
		( select ) => select( videoStudioStore ).getCurrentDurationSeconds(),
		[]
	);

	if ( ! currentVideoUrl || ! currentAttachmentId ) {
		return null;
	}

	const handleInsert = async () => {
		const { insertBlocks } = dispatch( 'core/block-editor' ) as unknown as BlockEditorActions;
		const block = createBlock( 'core/video', {
			id: currentAttachmentId,
			src: currentVideoUrl,
		} );
		await insertBlocks( block );
	};

	const handleEdit = () => {
		const { openImageStudio } = dispatch( imageStudioStore );
		openImageStudio( undefined, undefined, ImageStudioEntryPoint.PostEditorFeatureClip );
	};

	return (
		<div className="image-studio-feature-clip-result">
			<div className="image-studio-feature-clip-result__preview">
				<video
					src={ currentVideoUrl }
					className="image-studio-feature-clip-result__video"
					muted
					playsInline
					preload="metadata"
					controls
				/>
				{ currentDurationSeconds ? (
					<span className="image-studio-feature-clip-result__duration">
						{ formatDuration( currentDurationSeconds ) }
					</span>
				) : null }
			</div>
			<div className="image-studio-feature-clip-result__actions">
				<Button
					variant="primary"
					__next40pxDefaultSize
					className="image-studio-feature-clip-result__insert"
					onClick={ handleInsert }
				>
					{ __( 'Insert into post', __i18n_text_domain__ ) }
				</Button>
				<Button variant="secondary" __next40pxDefaultSize onClick={ handleEdit }>
					{ __( 'Edit', __i18n_text_domain__ ) }
				</Button>
			</div>
		</div>
	);
}

function formatDuration( seconds: number ): string {
	const m = Math.floor( seconds / 60 );
	const s = Math.floor( seconds % 60 );
	return `${ m }:${ s.toString().padStart( 2, '0' ) }`;
}
