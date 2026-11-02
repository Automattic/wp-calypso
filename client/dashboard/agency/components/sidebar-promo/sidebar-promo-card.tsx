import clsx from 'clsx';
import { useEffect, useRef } from 'react';
import NewTabLabel from '../new-tab-label';
import type { ReactNode } from 'react';

import './style.scss';

export interface SidebarPromoCardProps {
	/** Themes the card through its `--a4a-sidebar-promo-*` custom properties. */
	className?: string;
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
	/** Called once, when the card first renders. */
	onView?: () => void;
	onClick?: () => void;
}

/**
 * A compact promo card for the bottom of the agency sidebar, in both the
 * dashboard and a8c-for-agencies. `SidebarPromo` picks which one shows.
 */
export default function SidebarPromoCard( {
	className,
	icon,
	title,
	badge,
	description,
	cta,
	onView,
	onClick,
}: SidebarPromoCardProps ) {
	const hasRecordedView = useRef( false );
	useEffect( () => {
		if ( ! hasRecordedView.current ) {
			hasRecordedView.current = true;
			onView?.();
		}
	}, [ onView ] );

	return (
		<a
			className={ clsx( 'a4a-sidebar-promo-card', className ) }
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
