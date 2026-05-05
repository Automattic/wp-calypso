import { __ } from '@wordpress/i18n';
import clsx from 'clsx';

export interface ImagePickerItem {
	id: number;
	url: string;
	thumbnail: string;
	title: string;
	alt: string;
	width: number;
	height: number;
}

export interface ImagePickerState {
	isOpen: boolean;
	images: ImagePickerItem[];
	selectedNumber: number | null;
	purpose: 'block' | 'featured_image';
}

export function createEmptyPickerState(): ImagePickerState {
	return { isOpen: false, images: [], selectedNumber: null, purpose: 'block' };
}

interface ImagePickerModalProps {
	state: ImagePickerState;
}

export function ImagePickerModal( { state }: ImagePickerModalProps ) {
	if ( ! state.isOpen || state.images.length === 0 ) {
		return null;
	}

	return (
		<div className="dictation-image-picker" role="dialog" aria-label={ __( 'Pick an image' ) }>
			<div className="dictation-image-picker__header">
				<span className="dictation-image-picker__title">
					{ state.purpose === 'featured_image'
						? __( 'Pick a featured image — say a number' )
						: __( 'Pick an image — say a number' ) }
				</span>
			</div>
			<div className="dictation-image-picker__grid">
				{ state.images.map( ( img, i ) => {
					const num = i + 1;
					const isSelected = state.selectedNumber === num;
					return (
						<div
							key={ img.id }
							className={ clsx( 'dictation-image-picker__cell', {
								'is-selected': isSelected,
							} ) }
						>
							<img
								src={ img.thumbnail }
								alt={ img.alt || img.title }
								className="dictation-image-picker__thumb"
								draggable={ false }
							/>
							<span
								className={ clsx( 'dictation-image-picker__number', {
									'is-selected': isSelected,
								} ) }
							>
								{ num }
							</span>
						</div>
					);
				} ) }
			</div>
		</div>
	);
}
