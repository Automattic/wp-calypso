/* eslint-disable wpcalypso/jsx-classname-namespace */

import { Button } from '@automattic/components';
import { MShotsImage } from '@automattic/onboarding';
import { useViewportMatch } from '@wordpress/compose';
import { useI18n } from '@wordpress/react-i18n';
import classnames from 'classnames';
import { getDesignPreviewUrl, getMShotOptions } from '../utils';
import type { Design } from '../types';
import type { MShotsOptions } from '@automattic/onboarding';
import './style.scss';

const previewImageOptions: MShotsOptions = {
	vpw: 1600,
	vph: 1040,
	w: 2399,
	screen_height: 3600,
};

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

interface GeneratedDesignPreviewProps {
	slug: string;
	previewUrl: string;
	isSelected: boolean;
}

const GeneratedDesignPreview: React.FC< GeneratedDesignPreviewProps > = ( {
	slug,
	previewUrl,
	isSelected,
} ) => {
	return (
		<div className={ classnames( 'generated-design-preview', { 'is-selected': isSelected } ) }>
			<div className="generated-design-preview__header">
				<svg width="36" height="8">
					<g>
						<rect width="8" height="8" rx="4" />
						<rect x="14" width="8" height="8" rx="4" />
						<rect x="28" width="8" height="8" rx="4" />
					</g>
				</svg>
			</div>
			<div className="generated-design-preview__frame">
				<MShotsImage
					url={ previewUrl }
					alt=""
					aria-labelledby={ `generated-design-preview__image__${ slug }` }
					options={ previewImageOptions }
					scrollable={ false }
				/>
			</div>
		</div>
	);
};

export interface GeneratedDesignPickerProps {
	selectedDesign?: Design;
	designs: Design[];
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
	verticalId,
	locale,
	heading,
	footer,
	onPreview,
	onViewMore,
} ) => {
	const { __ } = useI18n();

	return (
		<div className="generated-design-picker">
			{ heading }
			<div className="generated_design-picker__content">
				<div className="generated-design-picker__thumbnails">
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
					<Button className="generated-design-picker__view-more" onClick={ onViewMore }>
						{ __( 'View more options' ) }
					</Button>
				</div>
				<div className="generated-design-picker__previews">
					{ designs &&
						designs.map( ( design ) => (
							<GeneratedDesignPreview
								key={ design.slug }
								slug={ design.slug }
								isSelected={ selectedDesign?.slug === design.slug }
								previewUrl={ getDesignPreviewUrl( design, { language: locale, verticalId } ) }
							/>
						) ) }
				</div>
			</div>
			{ footer }
		</div>
	);
};

export { GeneratedDesignPicker as default, GeneratedDesignPreview };
