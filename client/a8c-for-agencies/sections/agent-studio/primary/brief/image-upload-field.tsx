import {
	Button,
	FormFileUpload,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __, _n, sprintf } from '@wordpress/i18n';
import { closeSmall } from '@wordpress/icons';
import clsx from 'clsx';
import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import type { ChangeEvent, DragEvent } from 'react';

interface Props {
	agentId: string;
	label: string;
	help?: string;
	images: File[];
	onChange: ( images: File[] ) => void;
	disabled?: boolean;
	/** When true, note that the first image is used as the cover. */
	firstImageIsCover?: boolean;
}

let imageIdCounter = 0;

export default function ImageUploadField( {
	agentId,
	label,
	help,
	images,
	onChange,
	disabled,
	firstImageIsCover,
}: Props ) {
	const dispatch = useDispatch();

	// Cache a stable id and preview URL per File so thumbnails keep their
	// identity (and don't flicker) through reordering and removal.
	const cache = useRef( new Map< File, { id: string; url: string } >() );

	const previews = images.map( ( file ) => {
		let entry = cache.current.get( file );
		if ( ! entry ) {
			entry = { id: `image-${ imageIdCounter++ }`, url: URL.createObjectURL( file ) };
			cache.current.set( file, entry );
		}
		return { file, ...entry };
	} );

	// Revoke preview URLs for files that are no longer selected.
	useEffect( () => {
		const current = new Set( images );
		for ( const [ file, { url } ] of cache.current ) {
			if ( ! current.has( file ) ) {
				URL.revokeObjectURL( url );
				cache.current.delete( file );
			}
		}
	}, [ images ] );

	// Revoke everything left when the field unmounts.
	useEffect( () => {
		const entries = cache.current;
		return () => {
			for ( const { url } of entries.values() ) {
				URL.revokeObjectURL( url );
			}
			entries.clear();
		};
	}, [] );

	const draggingIndex = useRef< number | null >( null );
	const [ dragOverIndex, setDragOverIndex ] = useState< number | null >( null );

	const onAddImages = ( event: ChangeEvent< HTMLInputElement > ) => {
		const added = Array.from( event.target.files ?? [] );
		// Allow re-selecting the same file after a removal.
		event.target.value = '';
		if ( ! added.length ) {
			return;
		}
		const next = [ ...images, ...added ];
		onChange( next );
		dispatch(
			recordTracksEvent( 'calypso_a4a_agent_studio_brief_images_added', {
				agent_id: agentId,
				added: added.length,
				total: next.length,
			} )
		);
	};

	const removeImage = ( index: number ) => {
		const next = images.filter( ( _, i ) => i !== index );
		onChange( next );
		dispatch(
			recordTracksEvent( 'calypso_a4a_agent_studio_brief_image_removed', {
				agent_id: agentId,
				total: next.length,
			} )
		);
	};

	const moveImage = ( from: number, to: number ) => {
		if ( from === to ) {
			return;
		}
		const next = [ ...images ];
		const [ moved ] = next.splice( from, 1 );
		next.splice( to, 0, moved );
		onChange( next );
		dispatch(
			recordTracksEvent( 'calypso_a4a_agent_studio_brief_images_reordered', {
				agent_id: agentId,
			} )
		);
	};

	return (
		<VStack spacing={ 2 }>
			<Text weight={ 600 }>{ label }</Text>
			{ help && <Text variant="muted">{ help }</Text> }

			<HStack spacing={ 3 } justify="flex-start">
				<FormFileUpload
					accept="image/*"
					multiple
					onChange={ onAddImages }
					render={ ( { openFileDialog } ) => (
						<Button variant="secondary" onClick={ openFileDialog } disabled={ disabled }>
							{ __( 'Upload images' ) }
						</Button>
					) }
				/>
				{ images.length > 0 && (
					<Text variant="muted">
						{ sprintf(
							/* translators: %d is the number of selected images. */
							_n( '%d image selected', '%d images selected', images.length ),
							images.length
						) }
					</Text>
				) }
			</HStack>

			{ previews.length > 0 && (
				<VStack spacing={ 2 }>
					{ previews.length > 1 && (
						<Text variant="muted">
							{ firstImageIsCover
								? __( 'Drag a thumbnail to reorder. The first image is used as the cover.' )
								: __( 'Drag a thumbnail to reorder.' ) }
						</Text>
					) }
					<div className="a4a-agent-studio-image-upload__grid">
						{ previews.map( ( preview, index ) => (
							<div
								key={ preview.id }
								className={ clsx( 'a4a-agent-studio-image-upload__thumb', {
									'is-drag-over': dragOverIndex === index,
								} ) }
								draggable={ ! disabled }
								onDragStart={ ( event: DragEvent ) => {
									draggingIndex.current = index;
									event.dataTransfer.effectAllowed = 'move';
									// Firefox needs setData to actually start the drag.
									event.dataTransfer.setData( 'text/plain', String( index ) );
								} }
								onDragOver={ ( event: DragEvent ) => {
									if ( draggingIndex.current === null ) {
										return;
									}
									event.preventDefault();
									event.dataTransfer.dropEffect = 'move';
									if ( dragOverIndex !== index ) {
										setDragOverIndex( index );
									}
								} }
								onDragLeave={ () => {
									if ( dragOverIndex === index ) {
										setDragOverIndex( null );
									}
								} }
								onDrop={ ( event: DragEvent ) => {
									event.preventDefault();
									if ( draggingIndex.current !== null ) {
										moveImage( draggingIndex.current, index );
									}
									draggingIndex.current = null;
									setDragOverIndex( null );
								} }
								onDragEnd={ () => {
									draggingIndex.current = null;
									setDragOverIndex( null );
								} }
								title={ preview.file.name }
							>
								<img
									className="a4a-agent-studio-image-upload__thumb-image"
									src={ preview.url }
									alt={ preview.file.name }
									draggable={ false }
								/>
								<Button
									className="a4a-agent-studio-image-upload__thumb-remove"
									icon={ closeSmall }
									size="small"
									label={ sprintf(
										/* translators: %s is the image file name. */
										__( 'Remove %s' ),
										preview.file.name
									) }
									onClick={ () => removeImage( index ) }
									disabled={ disabled }
								/>
							</div>
						) ) }
					</div>
				</VStack>
			) }
		</VStack>
	);
}
