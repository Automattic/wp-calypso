/* eslint-disable wpcalypso/jsx-classname-namespace */

import { Button, Tooltip } from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import classnames from 'classnames';
import { useEffect, useState } from 'react';
import {
	getAvailableDesigns,
	getDesignUrl,
	mShotOptions,
	isBlankCanvasDesign,
	gatherCategories,
	filterDesignsByCategory,
} from '../utils';
import { DesignPickerCategoryFilter } from './design-picker-category-filter';
import MShotsImage from './mshots-image';
export { default as MShotsImage } from './mshots-image';
import type { Design } from '../types';

import './style.scss';

const makeOptionId = ( { slug }: Design ): string => `design-picker__option-name__${ slug }`;

interface DesignPreviewImageProps {
	design: Design;
	locale: string;
	highRes: boolean;
}

const DesignPreviewImage: React.FC< DesignPreviewImageProps > = ( { design, locale, highRes } ) => (
	<MShotsImage
		url={ getDesignUrl( design, locale ) }
		aria-labelledby={ makeOptionId( design ) }
		alt=""
		options={ mShotOptions( design, highRes ) }
		scrollable={ design.preview !== 'static' }
	/>
);

interface DesignButtonProps {
	design: Design;
	locale: string;
	onSelect: ( design: Design ) => void;
	premiumBadge?: React.ReactNode;
	highRes: boolean;
	disabled?: boolean;
}

const DesignButton: React.FC< DesignButtonProps > = ( {
	locale,
	onSelect,
	design,
	premiumBadge,
	highRes,
	disabled,
} ) => {
	const { __ } = useI18n();

	const isBlankCanvas = isBlankCanvasDesign( design );

	const defaultTitle = design.title;
	const blankCanvasTitle = __( 'Blank Canvas', __i18n_text_domain__ );
	const designTitle = isBlankCanvas ? blankCanvasTitle : defaultTitle;

	return (
		<button
			className="design-picker__design-option"
			disabled={ disabled }
			data-e2e-button={ design.is_premium ? 'paidOption' : 'freeOption' }
			onClick={ () => onSelect( design ) }
		>
			<span className="design-picker__design-option-header">
				<svg width="28" height="6">
					<g>
						<rect width="6" height="6" rx="3" />
						<rect x="11" width="6" height="6" rx="3" />
						<rect x="22" width="6" height="6" rx="3" />
					</g>
				</svg>
			</span>
			<span
				className={ classnames(
					'design-picker__image-frame',
					'design-picker__image-frame-landscape',
					design.preview === 'static' ? 'design-picker__static' : 'design-picker__scrollable',
					{ 'design-picker__image-frame-blank': isBlankCanvas }
				) }
			>
				{ isBlankCanvas ? (
					<div className="design-picker__image-frame-blank-canvas__title">
						{ __( 'Start from scratch', __i18n_text_domain__ ) }
					</div>
				) : (
					<div className="design-picker__image-frame-inside">
						<DesignPreviewImage design={ design } locale={ locale } highRes={ highRes } />
					</div>
				) }
			</span>
			<span className="design-picker__option-overlay">
				<span id={ makeOptionId( design ) } className="design-picker__option-meta">
					<span className="design-picker__option-name">{ designTitle }</span>
					{ design.is_premium && premiumBadge && (
						<Tooltip
							position="bottom center"
							text={ __( 'Requires a Personal plan or above', __i18n_text_domain__ ) }
						>
							<div className="design-picker__premium-container">{ premiumBadge }</div>
						</Tooltip>
					) }
				</span>
			</span>
		</button>
	);
};

interface DesignButtonCoverProps {
	design: Design;
	onSelect: ( design: Design ) => void;
	onPreview: ( design: Design ) => void;
}

const DesignButtonCover: React.FC< DesignButtonCoverProps > = ( {
	design,
	onSelect,
	onPreview,
} ) => {
	const { __ } = useI18n();

	return (
		<div className="design-button-cover">
			{ /* Make all of design button clickable and default behavior is preview  */ }
			<button
				className="design-button-cover__button-overlay"
				tabIndex={ -1 }
				onClick={ () => onPreview( design ) }
			/>
			<div className="design-button-cover__button-groups">
				<Button
					className="design-button-cover__button"
					isPrimary
					onClick={ () => onSelect( design ) }
				>
					{
						// translators: %s is the title of design with currency. Eg: Alves
						sprintf( __( 'Start with %s', __i18n_text_domain__ ), design.title )
					}
				</Button>
				<Button className="design-button-cover__button" onClick={ () => onPreview( design ) }>
					{
						// translators: %s is the title of design with currency. Eg: Alves
						sprintf( __( 'Preview %s', __i18n_text_domain__ ), design.title )
					}
				</Button>
			</div>
		</div>
	);
};

interface DesignButtonContainerProps extends DesignButtonProps {
	onPreview?: ( design: Design ) => void;
}

const DesignButtonContainer: React.FC< DesignButtonContainerProps > = ( {
	onPreview,
	...props
} ) => {
	const isDesktop = useViewportMatch( 'large' );
	const isBlankCanvas = isBlankCanvasDesign( props.design );

	if ( ! onPreview ) {
		return <DesignButton { ...props } />;
	}

	// Show the preview directly when selecting the design if the device is not desktop
	if ( ! isDesktop ) {
		return <DesignButton { ...props } onSelect={ onPreview } />;
	}

	// We don't need preview for blank canvas
	return (
		<div className="design-button-container">
			{ ! isBlankCanvas && (
				<DesignButtonCover
					design={ props.design }
					onSelect={ props.onSelect }
					onPreview={ onPreview }
				/>
			) }
			<DesignButton { ...props } disabled={ ! isBlankCanvas } />
		</div>
	);
};

export interface DesignPickerProps {
	locale: string;
	onSelect: ( design: Design ) => void;
	onPreview?: ( design: Design ) => void;
	designs?: Design[];
	premiumBadge?: React.ReactNode;
	isGridMinimal?: boolean;
	theme?: 'dark' | 'light';
	className?: string;
	highResThumbnails?: boolean;
	showCategoryFilter?: boolean;
}
const DesignPicker: React.FC< DesignPickerProps > = ( {
	locale,
	onSelect,
	onPreview,
	designs = getAvailableDesigns().featured.filter(
		// By default, exclude anchorfm-specific designs
		( design ) => design.features.findIndex( ( f ) => f === 'anchorfm' ) < 0
	),
	premiumBadge,
	isGridMinimal,
	theme = 'light',
	className,
	highResThumbnails = false,
	showCategoryFilter = false,
} ) => {
	const categories = gatherCategories( designs );
	const [ selectedCategory, setSelectedCategory ] = useState< string | null >(
		categories[ 0 ]?.slug ?? null
	);

	useEffect( () => {
		// When the category list changes check that the current selection
		// still matches one of the given slugs, and if it doesn't reset
		// the current selection.
		const findResult = categories.find( ( { slug } ) => slug === selectedCategory );
		if ( ! findResult ) {
			setSelectedCategory( categories[ 0 ]?.slug ?? null );
		}
	}, [ categories, selectedCategory ] );

	const filteredDesigns = ! showCategoryFilter
		? designs
		: filterDesignsByCategory( designs, selectedCategory );

	return (
		<div className={ classnames( 'design-picker', `design-picker--theme-${ theme }`, className ) }>
			{ showCategoryFilter && !! categories.length && (
				<DesignPickerCategoryFilter
					categories={ categories }
					selectedCategory={ selectedCategory }
					onSelect={ setSelectedCategory }
				/>
			) }
			<div className={ isGridMinimal ? 'design-picker__grid-minimal' : 'design-picker__grid' }>
				{ filteredDesigns.map( ( design ) => (
					<DesignButtonContainer
						key={ design.slug }
						design={ design }
						locale={ locale }
						onSelect={ onSelect }
						onPreview={ onPreview }
						premiumBadge={ premiumBadge }
						highRes={ highResThumbnails }
					/>
				) ) }
			</div>
		</div>
	);
};

export default DesignPicker;
