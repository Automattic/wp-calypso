import { Card } from '@automattic/components';
import classnames from 'classnames';
import StyleVariationBadges from '../style-variation-badges';
import { ActiveBadge } from './badges';
import type { StyleVariation } from '../../types';
import './style.scss';

interface ThemeCardProps {
	name: string;
	image: React.ReactNode;
	imageClickUrl?: string;
	imageActionLabel?: string;
	styleVariations: StyleVariation[];
	isActive?: boolean;
	onImageClick?: () => void;
	onStyleVariationClick?: () => void;
}

const ThemeCard: React.FC< ThemeCardProps > = ( {
	name,
	image,
	imageClickUrl,
	imageActionLabel,
	styleVariations = [],
	isActive,
	onImageClick,
	onStyleVariationClick,
} ) => {
	const isActionable = imageClickUrl || onImageClick;
	const themeClasses = classnames( 'theme-card', {
		'theme-card--is-active': isActive,
		'theme-card--is-actionable': isActionable,
	} );
	const themeInfoClasses = classnames( 'theme-card__info', {
		'theme-card__info--has-style-variations': styleVariations.length > 0,
	} );

	return (
		<Card className={ themeClasses }>
			<div className="theme-card__content">
				<a
					className="theme-card__image"
					href={ imageClickUrl || 'javascript:;' /* fallback for a11y */ }
					aria-label={ name }
					onClick={ onImageClick }
				>
					{ isActionable && <div className="theme-card__image-label">{ imageActionLabel }</div> }
					{ image }
				</a>
				<div className={ themeInfoClasses }>
					<h2 className="theme-card__info-title">{ name }</h2>
					{ isActive && <ActiveBadge /> }
					{ ! isActive && styleVariations.length > 0 && (
						<div className="theme-card__info-style-variations">
							<StyleVariationBadges
								variations={ styleVariations }
								onMoreClick={ onStyleVariationClick }
								onClick={ onStyleVariationClick }
							/>
						</div>
					) }
				</div>
			</div>
		</Card>
	);
};

export default ThemeCard;
