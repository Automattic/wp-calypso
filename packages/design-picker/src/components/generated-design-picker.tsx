/* eslint-disable wpcalypso/jsx-classname-namespace */

import { Button } from '@automattic/components';
import { MShotsImage } from '@automattic/onboarding';
import { useViewportMatch } from '@wordpress/compose';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import classnames from 'classnames';
import { useEffect, useRef } from 'react';
import {
	DEFAULT_VIEWPORT_WIDTH,
	DEFAULT_VIEWPORT_HEIGHT,
	MOBILE_VIEWPORT_WIDTH,
	STICKY_OFFSET_TOP,
} from '../constants';
import { getDesignPreviewUrl, getMShotOptions } from '../utils';
import type { Design } from '../types';
import './style.scss';

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {};

interface GeneratedDesignThumbnailProps {
	slug: string;
	thumbnailUrl: string;
	isSelected: boolean;
	onPreview: () => void;
	label: string;
}

const GeneratedDesignThumbnail: React.FC< GeneratedDesignThumbnailProps > = ( {
	slug,
	thumbnailUrl,
	isSelected,
	onPreview,
	label,
} ) => {
	const isMobile = useViewportMatch( 'small', '<' );

	return (
		<button
			type="button"
			aria-label={ label }
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
	const isMobile = useViewportMatch( 'small', '<' );
	const wrapperRef = useRef< HTMLDivElement >( null );

	useEffect( () => {
		if ( isMobile ) {
			wrapperRef.current?.style.removeProperty( 'height' );
			return noop;
		}

		const handleResponsive = () => {
			if ( ! wrapperRef.current ) {
				return;
			}

			const offsetTop = Math.max(
				wrapperRef.current.offsetTop - window.pageYOffset,
				STICKY_OFFSET_TOP
			);
			wrapperRef.current.style.setProperty( 'height', `calc( 100vh - ${ offsetTop }px` );
		};

		handleResponsive();

		window.addEventListener( 'resize', handleResponsive );
		window.addEventListener( 'scroll', handleResponsive );

		return () => {
			window.removeEventListener( 'resize', handleResponsive );
			window.removeEventListener( 'scroll', handleResponsive );
		};
	}, [ isMobile ] );

	return (
		<div className="generated-design-picker">
			{ heading }
			<div className="generated_design-picker__content">
				<div className="generated-design-picker__thumbnails" ref={ wrapperRef }>
					{ designs &&
						designs.map( ( design, index ) => (
							<GeneratedDesignThumbnail
								key={ design.slug }
								slug={ design.slug }
								thumbnailUrl={ getDesignPreviewUrl( design, {
									language: locale,
									verticalId,
									viewport_width: isMobile ? MOBILE_VIEWPORT_WIDTH : DEFAULT_VIEWPORT_WIDTH,
									viewport_height: DEFAULT_VIEWPORT_HEIGHT,
									use_screenshot_overrides: true,
								} ) }
								isSelected={ selectedDesign?.slug === design.slug }
								onPreview={ () => onPreview( design, index ) }
								/* translators: %s: Option number. Ex. Preview design option 1. */
								label={ sprintf( __( 'Preview design option %s' ), index + 1 ) }
							/>
						) ) }
					<Button className="generated-design-picker__view-more" onClick={ onViewMore }>
						{ __( 'View more options' ) }
					</Button>
				</div>
				<div className="generated-design-picker__main">
					<div className="generated-design-picker__previews">{ previews }</div>
					{ footer }
				</div>
			</div>
		</div>
	);
};

export default GeneratedDesignPicker;
