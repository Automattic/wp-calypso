import { ExternalLink as WPExternalLink } from '@wordpress/components';
import clsx from 'clsx';
import { ComponentProps, PropsWithChildren } from 'react';
import { Text } from '../text';
import './index.scss';

const titleFieldTextOverflowStyles = {
	overflow: 'hidden',
	textOverflow: 'ellipsis',
	whiteSpace: 'nowrap',
} as const;

interface Props extends PropsWithChildren {
	href: string;
	children: React.ReactNode;
	disabled: boolean;
	className?: string;
	ellipsisMode?: ComponentProps< typeof Text >[ 'ellipsizeMode' ];
}

export const ExternalLink = ( { href, children, disabled, className, ellipsisMode }: Props ) => {
	return disabled ? (
		<Text variant="muted" className={ className }>
			{ children }
		</Text>
	) : (
		<WPExternalLink
			className={ clsx( 'dashboard-external-link', { disabled } ) }
			style={ titleFieldTextOverflowStyles }
			href={ href }
		>
			{ children }
		</WPExternalLink>
	);
};
