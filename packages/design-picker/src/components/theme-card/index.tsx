import { Card } from '@automattic/components';
import classnames from 'classnames';
import { translate } from 'i18n-calypso';
import { useMemo } from 'react';
import StyleVariationBadges from '../style-variation-badges';
import type { StyleVariation } from '../../types';
import './style.scss';

interface ThemeCardProps {
	name: string;
	image: React.ReactNode;
	imageClickUrl?: string;
	imageActionLabel?: string;
	alert?: React.ReactNode;
	badge?: React.ReactNode;
	styleVariations: StyleVariation[];
	optionsMenu?: React.ReactNode;
	isActive?: boolean;
	isInstalling?: boolean;
	isSoftLaunched?: boolean;
	onImageClick?: () => void;
	onStyleVariationClick?: () => void;
}

const ThemeCard: React.FC< ThemeCardProps > = ( {
	name,
	image,
	imageClickUrl,
	imageActionLabel,
	alert,
	badge,
	styleVariations = [],
	optionsMenu,
	isActive,
	isInstalling,
	isSoftLaunched,
	onImageClick,
	onStyleVariationClick,
} ) => {
	const e2eName = useMemo( () => name.toLowerCase().replace( /\s+/g, '-' ), [ name ] );

	const isActionable = imageClickUrl || onImageClick;
	const themeClasses = classnames( 'theme', {
		'theme--is-active': isActive,
		'theme--is-actionable': isActionable,
	} );
	const themeInfoClasses = classnames( 'theme__info', {
		'theme__info--has-style-variations': styleVariations.length > 0,
	} );

	return (
		<Card className={ themeClasses } data-e2e-theme={ e2eName }>
			<div className="theme__content">
				{ alert && <div className="theme__alert">{ alert }</div> }
				<a
					className="theme__image"
					href={ imageClickUrl || 'javascript:;' /* fallback for a11y */ }
					aria-label={ name }
					onClick={ onImageClick }
				>
					{ isActionable && <div className="theme__image-label">{ imageActionLabel }</div> }
					{ image }
				</a>
				{ isInstalling && (
					<div className="theme__installing">
						<div className="theme__installing-dot" />
					</div>
				) }
				{ isSoftLaunched && (
					<div className="theme__info-soft-launched">
						<div className="theme__info-soft-launched-banner">{ translate( 'A8C Only' ) }</div>
					</div>
				) }
				<div className={ themeInfoClasses }>
					<h2 className="theme__info-title">{ name }</h2>
					{ isActive && (
						<span className="theme__info-badge theme__info-badge-active">
							{ translate( 'Active', {
								context: 'singular noun, the currently active theme',
							} ) }
						</span>
					) }
					{ ! isActive && styleVariations.length > 0 && (
						<div className="theme__info-style-variations">
							<StyleVariationBadges
								variations={ styleVariations }
								onMoreClick={ onStyleVariationClick }
								onClick={ onStyleVariationClick }
							/>
						</div>
					) }
					{ ! isActive && <div className="theme__info-pricing">{ badge }</div> }
					{ optionsMenu && <div className="theme__info-options">{ optionsMenu }</div> }
				</div>
			</div>
		</Card>
	);
};

export default ThemeCard;
