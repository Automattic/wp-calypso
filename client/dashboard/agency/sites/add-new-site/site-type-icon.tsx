import { Icon, plus } from '@wordpress/icons';
import type { ReactNode } from 'react';

import './style.scss';

/** A tiny code editor: window dots, highlighted lines and a blinking cursor. */
export function DevSiteMark() {
	return (
		<svg className="agency-add-site-menu__dev-mark" width="48" height="48" viewBox="0 0 48 48">
			<circle cx="10" cy="10" r="2" className="is-dot-red" />
			<circle cx="16" cy="10" r="2" className="is-dot-yellow" />
			<circle cx="22" cy="10" r="2" className="is-dot-green" />
			<rect x="9" y="19" width="10" height="3" rx="1.5" className="is-purple" />
			<rect x="21" y="19" width="16" height="3" rx="1.5" className="is-blue" />
			<rect x="14" y="26" width="18" height="3" rx="1.5" className="is-green" />
			<rect x="14" y="33" width="8" height="3" rx="1.5" className="is-orange" />
			<rect x="24" y="32" width="2" height="5" rx="1" className="is-cursor" />
		</svg>
	);
}

export type SiteTypeTone = 'wpcom' | 'a4a' | 'jetpack' | 'pressable' | 'dev';

/** A square tinted with the brand behind an option, holding its logo. */
export default function SiteTypeIcon( {
	tone,
	isNew,
	children,
}: {
	tone: SiteTypeTone;
	/** Badges the icon with a plus, to tell creating a WordPress.com site from connecting one. */
	isNew?: boolean;
	children: ReactNode;
} ) {
	return (
		<span className={ `agency-add-site-menu__icon is-${ tone }` } aria-hidden="true">
			{ children }
			{ isNew && (
				<span className="agency-add-site-menu__new">
					<Icon icon={ plus } size={ 14 } />
				</span>
			) }
		</span>
	);
}
