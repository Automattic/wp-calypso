import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { Badge } from '@wordpress/ui';
import clsx from 'clsx';
import { Text } from '../../../components/text';
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
	/** The whole card links here; a full URL opens in a new tab, a path in the same one. */
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
	const isExternal = /^https?:\/\//.test( cta.href );
	const label = <span className="a4a-sidebar-promo-card__link-label">{ cta.label }</span>;

	return (
		<a
			className={ clsx( 'a4a-sidebar-promo-card', className, { 'is-tone-dark': tone === 'dark' } ) }
			href={ cta.href }
			{ ...( isExternal && { target: '_blank', rel: 'noreferrer' } ) }
			onClick={ onClick }
		>
			<HStack as="span" spacing={ 3 } alignment="topLeft">
				<span className="a4a-sidebar-promo-card__icon">{ icon }</span>
				<VStack as="span" spacing={ 1 }>
					<HStack as="span" spacing={ 2 } justify="flex-start">
						<Text color="inherit" size={ 13 } weight={ 500 } lineHeight="20px">
							{ title }
						</Text>
						{ badge && (
							<Badge intent="stable" className="a4a-sidebar-promo-card__badge">
								{ badge }
							</Badge>
						) }
					</HStack>
					<Text
						variant="muted"
						size={ 12 }
						lineHeight="16px"
						className="a4a-sidebar-promo-card__description"
					>
						{ description }
					</Text>
					<Text color="inherit" size={ 12 } weight={ 500 } lineHeight="16px">
						{ isExternal ? <NewTabLabel justify="flex-start">{ label }</NewTabLabel> : label }
					</Text>
				</VStack>
			</HStack>
		</a>
	);
}
