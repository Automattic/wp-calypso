import type { TranslateResult } from 'i18n-calypso';

export interface SocialProfileStat {
	key: string;
	count: number;
	label: TranslateResult;
}

export interface SocialProfileCardProps {
	avatar?: string | null;
	bio?: string | null;
	stats: SocialProfileStat[];
	/** Accessible name for the stats list. Plain string — aria-label cannot be a ReactElement. */
	statsLabel: string;
}

/**
 * Presentational card for a connected social account's profile. Renders a
 * circular avatar, an inline stats row (bold count + muted label), and the
 * account bio. Protocol-agnostic — the caller supplies translated stat labels
 * and the profile data.
 */
export function SocialProfileCard( { avatar, bio, stats, statsLabel }: SocialProfileCardProps ) {
	return (
		<div className="social-profile-card">
			{ avatar ? (
				<img
					src={ avatar }
					alt=""
					className="social-profile-card__avatar"
					onError={ ( event ) => {
						event.currentTarget.style.display = 'none';
					} }
				/>
			) : null }
			<ul className="social-profile-card__stats" aria-label={ statsLabel }>
				{ stats.map( ( stat ) => (
					<li key={ stat.key } className="social-profile-card__stat">
						<span className="social-profile-card__stat-count">{ stat.count }</span>{ ' ' }
						<span className="social-profile-card__stat-label">{ stat.label }</span>
					</li>
				) ) }
			</ul>
			{ bio ? <p className="social-profile-card__bio">{ bio }</p> : null }
		</div>
	);
}
