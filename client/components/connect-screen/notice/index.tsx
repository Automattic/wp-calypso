import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { Icon, check, closeSmall, info, warning } from '@wordpress/icons';
import clsx from 'clsx';
import {
	Children,
	isValidElement,
	type AnchorHTMLAttributes,
	type HTMLAttributes,
	type ReactNode,
} from 'react';
import type { ButtonAsButtonProps } from '@wordpress/components/build-types/button/types';

import './style.scss';

export type NoticeIntent = 'neutral' | 'info' | 'warning' | 'success' | 'error';

interface NoticeRootProps extends HTMLAttributes< HTMLDivElement > {
	intent?: NoticeIntent;
	icon?: ReactNode | null;
}

interface NoticeTitleProps extends HTMLAttributes< HTMLHeadingElement > {
	as?: 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

type NoticeActionButtonProps = Omit< ButtonAsButtonProps, 'size' | 'variant' > & {
	className?: string;
};
type NoticeCloseIconProps = Omit< ButtonAsButtonProps, 'size' | 'variant' > & {
	className?: string;
};

const DEFAULT_NOTICE_ICONS: Record< NoticeIntent, ReactNode | null > = {
	neutral: null,
	info: <Icon icon={ info } size={ 20 } />,
	warning: <Icon icon={ warning } size={ 20 } />,
	success: <Icon icon={ check } size={ 20 } />,
	error: <Icon icon={ closeSmall } size={ 20 } />,
};

export function NoticeRoot( {
	children,
	className,
	icon,
	intent = 'neutral',
	...props
}: NoticeRootProps ): JSX.Element {
	const renderedIcon = icon === undefined ? DEFAULT_NOTICE_ICONS[ intent ] : icon;
	const contentChildren: ReactNode[] = [];
	let closeIconSlot: ReactNode = null;

	Children.forEach( children, ( child ) => {
		if ( ! closeIconSlot && isValidElement( child ) && child.type === NoticeCloseIcon ) {
			closeIconSlot = child;
			return;
		}

		contentChildren.push( child );
	} );

	return (
		<div
			className={ clsx(
				'connect-screen-notice',
				`is-intent-${ intent }`,
				renderedIcon && 'has-icon',
				className
			) }
			{ ...props }
		>
			{ renderedIcon && (
				<span className="connect-screen-notice-icon" aria-hidden="true">
					{ renderedIcon }
				</span>
			) }
			<div className="connect-screen-notice-content">{ contentChildren }</div>
			{ closeIconSlot }
		</div>
	);
}

export function NoticeTitle( {
	as: Tag = 'h3',
	children,
	className,
	...props
}: NoticeTitleProps ): JSX.Element {
	return (
		<Tag className={ clsx( 'connect-screen-notice-title', className ) } { ...props }>
			{ children }
		</Tag>
	);
}

export function NoticeDescription( {
	children,
	className,
	...props
}: HTMLAttributes< HTMLDivElement > ): JSX.Element {
	return (
		<div className={ clsx( 'connect-screen-notice-description', className ) } { ...props }>
			{ children }
		</div>
	);
}

export function NoticeActions( {
	children,
	className,
	...props
}: HTMLAttributes< HTMLDivElement > ): JSX.Element {
	return (
		<div className={ clsx( 'connect-screen-notice-actions', className ) } { ...props }>
			{ children }
		</div>
	);
}

export function NoticeActionButton( {
	children,
	className,
	...props
}: NoticeActionButtonProps ): JSX.Element {
	return (
		<Button
			size="small"
			variant="secondary"
			className={ clsx( 'connect-screen-notice-action-button', className ) }
			{ ...props }
		>
			{ children }
		</Button>
	);
}

export function NoticeCloseIcon( {
	className,
	children,
	icon = closeSmall,
	label,
	...props
}: NoticeCloseIconProps ): JSX.Element {
	return (
		<Button
			size="small"
			variant="tertiary"
			icon={ icon }
			label={ label ?? __( 'Dismiss', 'calypso' ) }
			className={ clsx( 'connect-screen-notice-close-icon', className ) }
			{ ...props }
		>
			{ children }
		</Button>
	);
}

export function NoticeActionLink( {
	children,
	className,
	...props
}: AnchorHTMLAttributes< HTMLAnchorElement > ): JSX.Element {
	return (
		<a className={ clsx( 'connect-screen-notice-action-link', className ) } { ...props }>
			{ children }
		</a>
	);
}
