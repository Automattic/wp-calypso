import { FormLabel } from '@automattic/components';
import clsx from 'clsx';

import './style.scss';

export function PanelSection( {
	isBorderless,
	children,
}: {
	isBorderless?: boolean;
	children: React.ReactNode;
} ) {
	return (
		<div className={ clsx( 'panel-section', { 'panel-section--borderless': isBorderless } ) }>
			{ children }
		</div>
	);
}

export function PanelHeading( {
	asFormLabel,
	children,
}: {
	asFormLabel?: boolean;
	children: React.ReactNode;
} ) {
	if ( asFormLabel ) {
		return <FormLabel>{ children }</FormLabel>;
	}
	return <h2>{ children }</h2>;
}

export function PanelDescription( { children }: { children: React.ReactNode } ) {
	return <p className="panel-description">{ children }</p>;
}
