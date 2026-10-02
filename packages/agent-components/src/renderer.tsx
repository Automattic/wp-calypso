import type { ButtonComponent, Surface, TextComponent } from './types';
import type { ReactNode } from 'react';

export function Column( { children }: { children: ReactNode } ) {
	return <div className="agent-components-column">{ children }</div>;
}

export function Text( { component }: { component: TextComponent } ) {
	const className = `agent-components-text agent-components-text--${ component.variant }`;
	if ( component.variant === 'heading' ) {
		return <h3 className={ className }>{ component.content.text }</h3>;
	}
	return (
		<p className={ className } role={ component.variant === 'status' ? 'status' : undefined }>
			{ component.content.text }
		</p>
	);
}

export function Button( {
	component,
	disabled,
	onAction,
}: {
	component: ButtonComponent;
	disabled: boolean;
	onAction: ( action: string ) => void;
} ) {
	return (
		<button
			type="button"
			className={ `agent-components-button agent-components-button--${ component.variant }` }
			disabled={ disabled }
			onClick={ () => onAction( component.action ) }
		>
			{ component.label }
		</button>
	);
}

export interface SurfaceRendererProps {
	surface: Surface;
	disabled?: boolean;
	onAction: ( action: string ) => void;
}

export function SurfaceRenderer( { surface, disabled = false, onAction }: SurfaceRendererProps ) {
	function render( id: string ): ReactNode {
		const component = surface.components[ id ];
		switch ( component.type ) {
			case 'Column':
				return <Column key={ id }>{ component.children.map( render ) }</Column>;
			case 'Text':
				return <Text key={ id } component={ component } />;
			case 'Button':
				return (
					<Button key={ id } component={ component } disabled={ disabled } onAction={ onAction } />
				);
		}
	}
	return <div className="agent-components">{ render( surface.rootId ) }</div>;
}
