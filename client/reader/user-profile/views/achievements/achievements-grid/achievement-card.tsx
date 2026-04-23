import type { ReactNode } from 'react';

interface AchievementCardProps {
	image: string;
	title: string;
	badge?: ReactNode;
	description?: ReactNode;
	caption?: ReactNode;
}

export default function AchievementCard( {
	image,
	title,
	badge,
	description,
	caption,
}: AchievementCardProps ) {
	return (
		<div className="achievement-card">
			<img className="achievement-card__icon" src={ image } alt="" />
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
