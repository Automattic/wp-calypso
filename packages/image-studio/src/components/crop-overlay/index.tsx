import { Button, RangeControl } from '@wordpress/components';
import { useEffect, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { ImageCropper, ImageCropperProvider, useImageCropper } from '@wordpress/image-cropper';
import { getCropTransform, type ImageTransform } from '../../utils/image-edit-modifiers';
import './style.scss';

export interface CropOverlayProps {
	imageUrl: string;
	disabled?: boolean;
	onApply: ( transform: ImageTransform ) => void;
	onCancel: () => void;
}

const MIN_ZOOM = 1;
const MAX_ZOOM = 5;

function CropTool( { imageUrl, disabled = false, onApply, onCancel }: CropOverlayProps ) {
	const { cropperState, setCropperState } = useImageCropper();
	const [ aspectRatioSlug, setAspectRatioSlug ] = useState( 'original' );
	const { mediaSize, croppedArea, zoom } = cropperState;

	const originalAspectRatio = mediaSize ? mediaSize.naturalWidth / mediaSize.naturalHeight : 1;
	const aspectRatios = [
		{ slug: 'original', label: __( 'Original', __i18n_text_domain__ ), value: originalAspectRatio },
		{ slug: '1:1', label: __( 'Square', __i18n_text_domain__ ), value: 1 },
		{ slug: '4:3', label: __( '4:3', __i18n_text_domain__ ), value: 4 / 3 },
		{ slug: '16:9', label: __( '16:9', __i18n_text_domain__ ), value: 16 / 9 },
	];

	const cropTransform = mediaSize && croppedArea ? getCropTransform( croppedArea ) : null;

	// The modal closes on Escape, so catch it first and leave crop mode instead.
	useEffect( () => {
		const handleKeyDown = ( event: KeyboardEvent ) => {
			if ( event.key === 'Escape' && ! event.defaultPrevented && ! event.isComposing ) {
				event.preventDefault();
				onCancel();
			}
		};
		document.addEventListener( 'keydown', handleKeyDown, true );
		return () => document.removeEventListener( 'keydown', handleKeyDown, true );
	}, [ onCancel ] );

	return (
		<div
			className="image-studio-crop"
			role="group"
			aria-label={ __( 'Crop image', __i18n_text_domain__ ) }
		>
			<div className="image-studio-crop__cropper">
				<ImageCropper
					src={ imageUrl }
					minZoom={ MIN_ZOOM }
					maxZoom={ MAX_ZOOM }
					onLoad={ ( size ) => {
						if ( aspectRatioSlug === 'original' ) {
							setCropperState( { aspectRatio: size.naturalWidth / size.naturalHeight } );
						}
					} }
				/>
			</div>
			<div className="image-studio-crop__controls">
				<div className="image-studio-crop__aspect-ratios">
					{ aspectRatios.map( ( aspectRatio ) => (
						<Button
							key={ aspectRatio.slug }
							variant="tertiary"
							size="compact"
							isPressed={ aspectRatioSlug === aspectRatio.slug }
							onClick={ () => {
								setAspectRatioSlug( aspectRatio.slug );
								setCropperState( { aspectRatio: aspectRatio.value } );
							} }
						>
							{ aspectRatio.label }
						</Button>
					) ) }
				</div>
				<RangeControl
					className="image-studio-crop__zoom"
					__next40pxDefaultSize
					__nextHasNoMarginBottom
					label={ __( 'Zoom', __i18n_text_domain__ ) }
					hideLabelFromVision
					withInputField={ false }
					min={ MIN_ZOOM }
					max={ MAX_ZOOM }
					step={ 0.1 }
					value={ zoom }
					onChange={ ( value ) => setCropperState( { zoom: value ?? MIN_ZOOM } ) }
				/>
				<div className="image-studio-crop__actions">
					<Button variant="tertiary" size="compact" onClick={ onCancel }>
						{ __( 'Cancel', __i18n_text_domain__ ) }
					</Button>
					<Button
						variant="primary"
						size="compact"
						disabled={ disabled || ! cropTransform }
						accessibleWhenDisabled
						onClick={ () => {
							if ( ! disabled && cropTransform ) {
								onApply( cropTransform );
							}
						} }
					>
						{ __( 'Apply', __i18n_text_domain__ ) }
					</Button>
				</div>
			</div>
		</div>
	);
}

export function CropOverlay( props: CropOverlayProps ) {
	return (
		<ImageCropperProvider>
			<CropTool { ...props } />
		</ImageCropperProvider>
	);
}
