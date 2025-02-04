import { Button, Card } from '@automattic/components';
import clsx from 'clsx';
import type { ReactNode } from 'react';

import './style.scss';

interface HostingCardProps {
	fallthrough?: boolean;
	className?: string;
	headingId?: string;
	title?: string;
	inGrid?: boolean;
	children: ReactNode;
}

interface HostingCardHeadingProps {
	className?: string;
	id?: string;
	title?: string;
	children?: ReactNode;
}

interface HostingCardDescriptionProps {
	hide?: boolean;
	children: string | ReactNode;
}

interface HostingCardLinkButtonProps {
	to: string;
	children: string | ReactNode;
	hideOnMobile?: boolean;
	onClick?: () => void;
}

interface HostingCardGridProps {
	children: ReactNode;
}

export function HostingCard( {
	fallthrough,
	className,
	headingId,
	title,
	inGrid,
	children,
}: HostingCardProps ) {
	if ( fallthrough ) {
		return children;
	}
	return (
		<Card className={ clsx( 'hosting-card', className, { 'hosting-card--in-grid': inGrid } ) }>
			{ title && (
				<h3 id={ headingId } className="hosting-card__title">
					{ title }
				</h3>
			) }
			{ children }
		</Card>
	);
}

export function HostingCardHeading( { id, title, children }: HostingCardHeadingProps ) {
	return (
		<div className="hosting-card__heading">
			{ title && (
				<h3 id={ id } className="hosting-card__title">
					{ title }
				</h3>
			) }
			{ children }
		</div>
	);
}

export function HostingCardDescription( { hide, children }: HostingCardDescriptionProps ) {
	if ( hide ) {
		return null;
	}
	return <p className="hosting-card__description">{ children }</p>;
}

export function HostingCardLinkButton( {
	to,
	children,
	hideOnMobile,
	onClick,
}: HostingCardLinkButtonProps ) {
	return (
		<Button
			className={ clsx( 'hosting-card__link-button', {
				'hosting-card__link-button--hide-on-mobile': hideOnMobile,
			} ) }
			plain
			href={ to }
			onClick={ onClick }
		>
			{ children }
		</Button>
	);
}

export function HostingCardGrid( props: HostingCardGridProps ) {
	return <div className="hosting-card-grid">{ props.children }</div>;
}
