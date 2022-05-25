/* eslint-disable wpcalypso/jsx-classname-namespace */

import { Button } from '@automattic/components';
import { MShotsImage } from '@automattic/onboarding';
import { useViewportMatch } from '@wordpress/compose';
import { useI18n } from '@wordpress/react-i18n';
import classnames from 'classnames';
import { useEffect, useRef } from 'react';
import { getDesignPreviewUrl, getMShotOptions } from '../utils';
import type { Design } from '../types';
import './style.scss';

interface GeneratedDesignThumbnailProps {
	slug: string;
	thumbnailUrl: string;
	isSelected: boolean;
	onPreview: () => void;
}

const GeneratedDesignThumbnail: React.FC< GeneratedDesignThumbnailProps > = ( {
	slug,
	thumbnailUrl,
	isSelected,
	onPreview,
} ) => {
	const isMobile = useViewportMatch( 'small', '<' );

	return (
		<button
			type="button"
			className={ classnames( 'generated-design-thumbnail', { 'is-selected': isSelected } ) }
			onClick={ onPreview }
		>
			<span className="generated-design-thumbnail__header">
				<svg width="28" height="6">
					<g>
						<rect width="6" height="6" rx="3" />
						<rect x="11" width="6" height="6" rx="3" />
						<rect x="22" width="6" height="6" rx="3" />
					</g>
				</svg>
			</span>
			<span className="generated-design-thumbnail__image">
				<MShotsImage
					url={ thumbnailUrl }
					alt=""
					aria-labelledby={ `generated-design-thumbnail__image__${ slug }` }
					options={ getMShotOptions( { isMobile } ) }
					scrollable={ false }
				/>
			</span>
		</button>
	);
};

export interface GeneratedDesignPickerProps {
	selectedDesign?: Design;
	designs: Design[];
	previews: React.ReactElement[];
	verticalId: string;
	locale: string;
	heading?: React.ReactElement;
	footer?: React.ReactElement;
	onPreview: ( design: Design, positionIndex: number ) => void;
	onViewMore: () => void;
}

const GeneratedDesignPicker: React.FC< GeneratedDesignPickerProps > = ( {
	selectedDesign,
	designs,
	previews,
	verticalId,
	locale,
	heading,
	footer,
	onPreview,
	onViewMore,
} ) => {
	const { __ } = useI18n();

	/* eslint-disable @typescript-eslint/no-unused-vars */
	const wrapperRef = useRef< HTMLDivElement >( null );
	const propertyForThumbnailHeight = '--thumbnail-design-height';

	useEffect( () => {
		const onResize = () => {
			const { current: thumnbnailWrapper } = wrapperRef;
			if ( ! thumnbnailWrapper ) {
				return;
			}

			const viewportHeight = Math.max(
				document.documentElement.clientHeight,
				window.innerHeight || 0
			);
			const wrapperMaxHeight =
				viewportHeight - ( thumnbnailWrapper.getClientRects()[ 0 ].y + window.scrollY );
			const thumbnailHeight = wrapperMaxHeight / 3;
			const thumbnailActualHeight = Math.min( 300, Math.max( 100, thumbnailHeight ) );

			thumnbnailWrapper.style.setProperty(
				propertyForThumbnailHeight,
				`${ thumbnailActualHeight }px`
			);
		};

		window.addEventListener( 'resize', onResize );
		onResize();

		return () => {
			window.removeEventListener( 'resize', onResize );
		};
	}, [] );
	/* eslint-enable @typescript-eslint/no-unused-vars */

	return (
		<div className="generated-design-picker">
			{ heading }
			<div className="generated_design-picker__content">
				<div className="generated-design-picker__thumbnails">
					<div className="generated-design-picker__thumbnails-wrapper" ref={ wrapperRef }>
						{ designs &&
							designs.map( ( design, index ) => (
								<GeneratedDesignThumbnail
									key={ design.slug }
									slug={ design.slug }
									thumbnailUrl={ getDesignPreviewUrl( design, { language: locale, verticalId } ) }
									isSelected={ selectedDesign?.slug === design.slug }
									onPreview={ () => onPreview( design, index ) }
								/>
							) ) }
					</div>
					<div className="generated-design-picker__view-more-wrapper">
						<Button className="generated-design-picker__view-more" onClick={ onViewMore }>
							{ __( 'View more options' ) }
						</Button>
					</div>
				</div>
				<div className="generated-design-picker__previews">{ previews }</div>
			</div>
			{ footer }
		</div>
	);
};

export default GeneratedDesignPicker;
