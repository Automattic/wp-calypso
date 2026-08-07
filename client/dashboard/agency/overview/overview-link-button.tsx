import { Button } from '@wordpress/components';
import RouterLinkButton from '../../components/router-link-button';
import type { ComponentProps, ReactNode } from 'react';

interface OverviewLinkButtonProps {
	href: string;
	children: ReactNode;
	variant?: ComponentProps< typeof Button >[ 'variant' ];
	size?: ComponentProps< typeof Button >[ 'size' ];
	onClick?: React.MouseEventHandler< HTMLAnchorElement >;
	/**
	 * Set to false in apps without the dashboard's TanStack Router, so the button
	 * renders a plain anchor for the host app's own router to pick up.
	 */
	shouldUseRouterLink?: boolean;
}

export default function OverviewLinkButton( {
	href,
	children,
	variant,
	size,
	onClick,
	shouldUseRouterLink = true,
}: OverviewLinkButtonProps ) {
	if ( shouldUseRouterLink ) {
		return (
			<RouterLinkButton to={ href } variant={ variant } size={ size } onClick={ onClick }>
				{ children }
			</RouterLinkButton>
		);
	}

	return (
		<Button href={ href } variant={ variant } size={ size } onClick={ onClick }>
			{ children }
		</Button>
	);
}
