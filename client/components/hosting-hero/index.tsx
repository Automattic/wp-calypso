import { Button } from '@wordpress/components';
import type { ReactNode, ComponentProps } from 'react';

import './style.scss';

interface HostingHeroProps {
	children: ReactNode;
}

export function HostingHero( { children }: HostingHeroProps ) {
	return <div className="hosting-hero">{ children }</div>;
}

export function HostingHeroButton( props: ComponentProps< typeof Button > ) {
	return <Button variant="primary" className="hosting-hero-button" { ...props } />;
}
