import { Icon } from '@wordpress/components';
import { lock } from '@wordpress/icons';
import clsx from 'clsx';
import type { ReactNode } from 'react';

interface AchievementCardProps {
	title: string;
	badge?: ReactNode;
	description?: ReactNode;
	caption?: ReactNode;
	image?: string;
	locked?: boolean;
	secret?: boolean;
}

export default function AchievementCard( {
	image,
	title,
	badge,
	description,
	caption,
	locked,
	secret,
}: AchievementCardProps ) {
	const showLockIcon = locked || secret;
	const rootClass = clsx( 'achievement-card', {
		'is-locked': locked,
		'is-secret': secret,
	} );

	return (
		<div className={ rootClass }>
			{ showLockIcon ? (
				<div className="achievement-card__icon achievement-card__icon--lock">
					<Icon icon={ lock } />
				</div>
			) : (
				<img className="achievement-card__icon" src={ image } alt="" />
			) }
			<div className="achievement-card__details">
				<h3 className="achievement-card__title">
					{ title }
					{ badge && <span className="achievement-card__badge">{ badge }</span> }
				</h3>
				{ description && <p className="achievement-card__description">{ description }</p> }
				{ caption && <p className="achievement-card__caption">{ caption }</p> }
			</div>
		</div>
	);
}
