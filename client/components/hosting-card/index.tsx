import { Button, Card } from '@automattic/components';
import clsx from 'clsx';
import type { ReactNode } from 'react';

import './style.scss';

interface HostingCardProps {
	className?: string;
	headingId?: string;
	title?: string;
	children: ReactNode;
}

interface HostingCardHeadingProps {
	className?: string;
	id?: string;
	title?: string;
	children?: ReactNode;
}

interface HostingCardDescriptionProps {
	children: string | ReactNode;
}

export function HostingCard( { className, headingId, title, children }: HostingCardProps ) {
	return (
		<Card className={ clsx( 'hosting-card', className ) }>
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

export function HostingCardDescription( { children }: HostingCardDescriptionProps ) {
	return <p className="hosting-card__description">{ children }</p>;
}

interface HostingCardLinkButtonProps {
	to: string;
	children: string | ReactNode;
	hideOnMobile?: boolean;
}

export function HostingCardLinkButton( {
	to,
	children,
	hideOnMobile,
}: HostingCardLinkButtonProps ) {
	return (
		<Button
			className={ clsx( 'hosting-card__link-button', {
				'hosting-card__link-button--hide-on-mobile': hideOnMobile,
			} ) }
			plain
			href={ to }
		>
			{ children }
		</Button>
	);
}
