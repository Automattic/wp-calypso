import { createLink } from '@tanstack/react-router';
import { LinkButton, Notice as UINotice } from '@wordpress/ui';
import { forwardRef, type ComponentProps } from 'react';

/**
 * A notice action that runs something on click.
 */
export const NoticeActionButton = UINotice.ActionButton;

/**
 * A notice action that navigates, styled as a link.
 */
export const NoticeActionLink = UINotice.ActionLink;

/**
 * A notice action that navigates, styled as a button. Uses the same size and
 * tone as `NoticeActionButton`.
 */
export const NoticeActionLinkButton = forwardRef<
	HTMLAnchorElement,
	Omit< ComponentProps< typeof LinkButton >, 'size' | 'tone' >
>( function NoticeActionLinkButton( props, ref ) {
	return <LinkButton ref={ ref } { ...props } size="compact" tone="neutral" />;
} );

/**
 * `NoticeActionLink` for router destinations (`to`, `params`, …).
 */
export const RouterNoticeActionLink = createLink( NoticeActionLink );

/**
 * `NoticeActionLinkButton` for router destinations (`to`, `params`, …).
 */
export const RouterNoticeActionLinkButton = createLink( NoticeActionLinkButton );
