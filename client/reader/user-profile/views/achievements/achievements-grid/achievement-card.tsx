import { ProgressBar } from '@automattic/components';
import { formatNumber } from '@automattic/number-formatters';
import { Icon } from '@wordpress/components';
import { lock } from '@wordpress/icons';
import clsx from 'clsx';
import type { ReactNode } from 'react';

interface AchievementCardProps {
	title: string;
	badge?: ReactNode;
	description?: ReactNode;
	caption?: ReactNode;
	iconNode?: ReactNode;
	image?: string;
	locked?: boolean;
	secret?: boolean;
	progressCurrent?: number;
	progressTarget?: number;
	className?: string;
}

export default function AchievementCard( {
	image,
	iconNode,
	title,
	badge,
	description,
	caption,
	locked,
	secret,
	progressCurrent,
	progressTarget,
	className,
}: AchievementCardProps ) {
	const showLockIcon = locked || secret;
	const rootClass = clsx( 'achievement-card', className, {
		'is-locked': locked,
		'is-secret': secret,
	} );

	const renderIcon = () => {
		if ( showLockIcon ) {
			return (
				<div className="achievement-card__icon achievement-card__icon--lock">
					<Icon icon={ lock } />
				</div>
			);
		}
		if ( iconNode ) {
			return iconNode;
		}
		return <img className="achievement-card__icon" src={ image } alt="" />;
	};

	return (
		<div className={ rootClass }>
			{ renderIcon() }
			<div className="achievement-card__details">
				<h3 className="achievement-card__title">
					{ title }
					{ badge && <span className="achievement-card__badge">{ badge }</span> }
				</h3>
				{ description && <p className="achievement-card__description">{ description }</p> }
				{ caption && <p className="achievement-card__caption">{ caption }</p> }
				{ progressTarget !== undefined && (
					<div className="achievement-card__progress">
						<ProgressBar
							className="achievement-card__progress-bar"
							value={ progressCurrent ?? 0 }
							total={ progressTarget }
						/>
						<span className="achievement-card__progress-label">
							{ `${ formatNumber( progressCurrent ?? 0 ) }/${ formatNumber( progressTarget ) }` }
						</span>
					</div>
				) }
			</div>
		</div>
	);
}
