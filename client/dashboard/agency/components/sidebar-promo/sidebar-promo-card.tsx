import clsx from 'clsx';
import { useRecordViewOnce } from '../../lib/use-record-view-once';
import NewTabLabel from '../new-tab-label';
import type { ReactNode } from 'react';

import './style.scss';

const noop = () => {};

export type SidebarPromoTone = 'light' | 'dark';

export interface SidebarPromoCardProps {
	/** Stable per promo; the view is recorded once per page load for each. */
	id: string;
	/** Themes the card through its `--a4a-sidebar-promo-*` custom properties. */
	className?: string;
	/** The sidebar behind the card, so a promo can adjust colors that would vanish on it. */
	tone?: SidebarPromoTone;
	/** Shown in a 32px tile, sized to hold a 20px icon. */
	icon: ReactNode;
	title: string;
	/** A short label beside the title, such as "New". */
	badge?: string;
	description: string;
	/** The whole card links here, in a new tab. */
	cta: {
		label: string;
		href: string;
	};
	/** Called the first time the card renders in the page load. */
	onView?: () => void;
	onClick?: () => void;
}

/**
 * A compact promo card for the bottom of the agency sidebar, in both the
 * dashboard and a8c-for-agencies. `SidebarPromo` picks which one shows.
 */
export default function SidebarPromoCard( {
	id,
	className,
	tone = 'light',
	icon,
	title,
	badge,
	description,
	cta,
	onView,
	onClick,
}: SidebarPromoCardProps ) {
	useRecordViewOnce( `sidebar-promo:${ id }`, onView ?? noop );

	return (
		<a
			className={ clsx( 'a4a-sidebar-promo-card', className, { 'is-tone-dark': tone === 'dark' } ) }
			href={ cta.href }
			target="_blank"
			rel="noreferrer"
			onClick={ onClick }
		>
			<span className="a4a-sidebar-promo-card__icon">{ icon }</span>
			<span className="a4a-sidebar-promo-card__text">
				<span className="a4a-sidebar-promo-card__title">
					{ title }
					{ badge && <span className="a4a-sidebar-promo-card__badge">{ badge }</span> }
				</span>
				<span className="a4a-sidebar-promo-card__description">{ description }</span>
				<span className="a4a-sidebar-promo-card__link">
					<NewTabLabel justify="flex-start">
						<span className="a4a-sidebar-promo-card__link-label">{ cta.label }</span>
					</NewTabLabel>
				</span>
			</span>
		</a>
	);
}
