import { Card, Popover } from '@automattic/components';
import classnames from 'classnames';
import { translate } from 'i18n-calypso';
import { forwardRef, useMemo, useRef, useState } from 'react';
import StyleVariationBadges from '../style-variation-badges';
import type { StyleVariation } from '../../types';
import type { Ref } from 'react';
import './style.scss';

interface ThemeCardProps {
	name: string;
	description?: string;
	image: React.ReactNode;
	imageClickUrl?: string;
	imageActionLabel?: string;
	banner?: React.ReactNode;
	badge?: React.ReactNode;
	styleVariations: StyleVariation[];
	optionsMenu?: React.ReactNode;
	isActive?: boolean;
	isInstalling?: boolean;
	isShowDescriptionOnImageHover?: boolean;
	isSoftLaunched?: boolean;
	onClick?: () => void;
	onImageClick?: () => void;
	onStyleVariationClick?: () => void;
}

const ThemeCard = forwardRef(
	(
		{
			name,
			description,
			image,
			imageClickUrl,
			imageActionLabel,
			banner,
			badge,
			styleVariations = [],
			optionsMenu,
			isActive,
			isInstalling,
			isShowDescriptionOnImageHover,
			isSoftLaunched,
			onClick,
			onImageClick,
			onStyleVariationClick,
		}: ThemeCardProps,
		forwardedRef: Ref< any > // eslint-disable-line @typescript-eslint/no-explicit-any
	) => {
		const e2eName = useMemo( () => name.toLowerCase().replace( /\s+/g, '-' ), [ name ] );
		const imageRef = useRef< HTMLAnchorElement >( null );
		const [ isShowTooltip, setIsShowTooltip ] = useState( false );

		const isActionable = imageClickUrl || onImageClick;
		const themeClasses = classnames( 'theme-card', {
			'theme-card--is-active': isActive,
			'theme-card--is-actionable': isActionable,
		} );
		const themeInfoClasses = classnames( 'theme-card__info', {
			'theme-card__info--has-style-variations': styleVariations.length > 0,
		} );

		return (
			<Card className={ themeClasses } onClick={ onClick } data-e2e-theme={ e2eName }>
				<div ref={ forwardedRef } className="theme-card__content">
					{ banner && <div className="theme-card__banner">{ banner }</div> }
					<a
						ref={ imageRef }
						className="theme-card__image"
						href={ imageClickUrl || 'javascript:;' /* fallback for a11y */ }
						aria-label={ name }
						onClick={ onImageClick }
						onMouseEnter={ () => setIsShowTooltip( true ) }
						onMouseLeave={ () => setIsShowTooltip( false ) }
					>
						{ isActionable && <div className="theme-card__image-label">{ imageActionLabel }</div> }
						{ image }
					</a>
					{ isInstalling && (
						<div className="theme-card__installing">
							<div className="theme-card__installing-dot" />
						</div>
					) }
					{ isShowDescriptionOnImageHover && description && (
						<Popover
							className="theme-card__tooltip"
							context={ imageRef.current }
							isVisible={ isShowTooltip }
							showDelay={ 1000 }
						>
							{ description }
						</Popover>
					) }
					{ isSoftLaunched && (
						<div className="theme-card__info-soft-launched">
							<div className="theme-card__info-soft-launched-banner">
								{ translate( 'A8C Only' ) }
							</div>
						</div>
					) }
					<div className={ themeInfoClasses }>
						<h2 className="theme-card__info-title">{ name }</h2>
						{ isActive && (
							<span className="theme-card__info-badge theme-card__info-badge-active">
								{ translate( 'Active', {
									context: 'singular noun, the currently active theme',
								} ) }
							</span>
						) }
						{ ! isActive && styleVariations.length > 0 && (
							<div className="theme-card__info-style-variations">
								<StyleVariationBadges
									variations={ styleVariations }
									onMoreClick={ onStyleVariationClick }
									onClick={ onStyleVariationClick }
								/>
							</div>
						) }
						{ ! isActive && <div className="theme-card__info-pricing">{ badge }</div> }
						{ optionsMenu && <div className="theme-card__info-options">{ optionsMenu }</div> }
					</div>
				</div>
			</Card>
		);
	}
);

export default ThemeCard;
