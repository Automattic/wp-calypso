/* eslint-disable wpcalypso/jsx-classname-namespace */

/**
 * External dependencies
 */
import React from 'react';
import classnames from 'classnames';
import { Tooltip } from '@wordpress/components';
import { useI18n } from '@wordpress/react-i18n';
import { isEnabled } from '@automattic/calypso-config';

/**
 * Internal dependencies
 */
import MShotsImage from './mshots-image';
import { getAvailableDesigns, getDesignImageUrl, getDesignUrl, mShotOptions } from '../utils';
import type { Design } from '../types';

/**
 * Style dependencies
 */
import './style.scss';

const makeOptionId = ( { slug }: Design ): string => `design-picker__option-name__${ slug }`;

// TODO: move to utils and add tests
const isBlankCanvasDesign = ( design: Design ): boolean => /blank-canvas/i.test( design.slug );

interface DesignPreviewImageProps {
	design: Design;
	locale: string;
}

const DesignPreviewImage: React.FC< DesignPreviewImageProps > = ( { design, locale } ) =>
	isEnabled( 'gutenboarding/mshot-preview' ) ? (
		<MShotsImage
			url={ getDesignUrl( design, locale ) }
			aria-labelledby={ makeOptionId( design ) }
			alt=""
			options={ mShotOptions() }
			scrollable={ design.preview !== 'static' }
		/>
	) : (
		<img alt="" aria-labelledby={ makeOptionId( design ) } src={ getDesignImageUrl( design ) } />
	);

interface DesignButtonProps {
	design: Design;
	locale: string;
	onSelect: ( design: Design ) => void;
	premiumBadge?: React.ReactNode;
}

const DesignButton: React.FC< DesignButtonProps > = ( {
	locale,
	onSelect,
	design,
	premiumBadge,
} ) => {
	const { __ } = useI18n();

	const isBlankCanvas = isBlankCanvasDesign( design );

	const defaultTitle = design.title;
	const blankCanvasTitle = __( 'Start with an empty page', __i18n_text_domain__ );
	const designTitle = isBlankCanvas ? blankCanvasTitle : defaultTitle;

	return (
		<button
			key={ design.slug }
			className="design-picker__design-option"
			data-e2e-button={ design.is_premium ? 'paidOption' : 'freeOption' }
			onClick={ () => onSelect( design ) }
		>
			<span
				className={ classnames(
					'design-picker__image-frame',
					isEnabled( 'gutenboarding/landscape-preview' )
						? 'design-picker__image-frame-landscape'
						: 'design-picker__image-frame-portrait',
					design.preview === 'static' ? 'design-picker__static' : 'design-picker__scrollable'
				) }
			>
				<div
					className={ classnames( 'design-picker__image-frame-inside', {
						'design-picker__image-frame-inside--blank': isBlankCanvas,
					} ) }
					aria-hidden="true"
				>
					{ ! isBlankCanvas && <DesignPreviewImage design={ design } locale={ locale } /> }
				</div>
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

interface DesignPickerProps {
	locale: string;
	onSelect: ( design: Design ) => void;
	designs?: Design[];
	premiumBadge?: React.ReactNode;
	isGridMinimal?: boolean;
}
const DesignPicker: React.FC< DesignPickerProps > = ( {
	locale,
	onSelect,
	designs = getAvailableDesigns().featured.filter(
		// By default, exclude anchorfm-specific designs
		( design ) => design.features.findIndex( ( f ) => f === 'anchorfm' ) < 0
	),
	premiumBadge,
	isGridMinimal,
} ) => {
	return (
		<div className="design-picker">
			<div className={ isGridMinimal ? 'design-picker__grid-minimal' : 'design-picker__grid' }>
				{ designs.map( ( design ) => (
					<DesignButton
						design={ design }
						locale={ locale }
						onSelect={ onSelect }
						premiumBadge={ premiumBadge }
					/>
				) ) }
			</div>
		</div>
	);
};

export default DesignPicker;
