import { Button } from '@wordpress/components';
import RouterLinkButton from '../../components/router-link-button';
import type { ComponentProps, ReactNode } from 'react';

interface LinkButtonProps {
	href: string;
	children: ReactNode;
	variant?: ComponentProps< typeof Button >[ 'variant' ];
	size?: ComponentProps< typeof Button >[ 'size' ];
	disabled?: boolean;
	onClick?: React.MouseEventHandler< HTMLAnchorElement >;
	/**
	 * Set to false in apps without the dashboard's TanStack Router, so the button
	 * renders a plain anchor for the host app's own router to pick up.
	 */
	shouldUseRouterLink?: boolean;
}

/**
 * A link-shaped button shared by the dashboard and the classic A4A app.
 * Dashboard-internal paths render as router links; absolute URLs (screens not
 * migrated to the dashboard yet) always render as plain anchors.
 */
export default function LinkButton( {
	href,
	children,
	variant,
	size,
	disabled,
	onClick,
	shouldUseRouterLink = true,
}: LinkButtonProps ) {
	// Anchors can't be disabled, so a disabled link renders as a plain button.
	if ( disabled ) {
		return (
			<Button variant={ variant } size={ size } disabled accessibleWhenDisabled>
				{ children }
			</Button>
		);
	}

	if ( shouldUseRouterLink && href.startsWith( '/' ) ) {
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
