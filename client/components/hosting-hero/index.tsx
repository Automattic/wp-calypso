import { Button } from '@wordpress/components';
import clsx from 'clsx';
import type { ReactNode, ComponentProps } from 'react';

import './style.scss';

interface HostingHeroProps {
	children: ReactNode;
	className?: string;
}

export function HostingHero( { children, className }: HostingHeroProps ) {
	return <div className={ clsx( 'hosting-hero', className ) }>{ children }</div>;
}

export function HostingHeroButton( props: ComponentProps< typeof Button > ) {
	return <Button variant="primary" className="hosting-hero-button" { ...props } />;
}
