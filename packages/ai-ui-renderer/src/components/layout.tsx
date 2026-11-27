import type { ReactNode, CSSProperties } from 'react';

interface LayoutProps {
	children: Array< string | { id: string; basePath: string } >;
	buildChild: ( id: string, basePath?: string ) => ReactNode;
	gap?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
	align?: 'start' | 'center' | 'end' | 'stretch';
}

function childrenOf( { children, buildChild }: LayoutProps ) {
	return children.map( ( child ) =>
		typeof child === 'string' ? buildChild( child ) : buildChild( child.id, child.basePath )
	);
}

export function Grid(
	props: LayoutProps & {
		minColumnWidth?: number;
		columns?: number;
		balance?: 'equal' | 'wideStart' | 'wideEnd';
	}
) {
	return (
		<div className="ai-ui-renderer__grid-container">
			<div
				className="ai-ui-renderer__grid"
				data-gap={ props.gap ?? 'lg' }
				data-balance={ props.balance ?? 'equal' }
				style={
					{
						'--ai-ui-grid-min': `${ props.minColumnWidth ?? 248 }px`,
						'--ai-ui-grid-columns': props.columns ?? 1000,
						alignItems: props.align ?? 'stretch',
					} as CSSProperties
				}
			>
				{ childrenOf( props ) }
			</div>
		</div>
	);
}

export function Stack(
	props: LayoutProps & {
		direction?: 'row' | 'column';
		justify?: 'start' | 'center' | 'end' | 'space-between';
		wrap?: boolean;
	}
) {
	return (
		<div
			className="ai-ui-renderer__stack"
			data-gap={ props.gap ?? 'md' }
			style={ {
				flexDirection: props.direction ?? 'column',
				flexWrap: props.wrap ? 'wrap' : 'nowrap',
				alignItems: props.align ?? 'stretch',
				justifyContent: props.justify ?? 'start',
			} }
		>
			{ childrenOf( props ) }
		</div>
	);
}
