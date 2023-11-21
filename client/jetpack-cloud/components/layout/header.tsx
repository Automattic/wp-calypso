import { Children, ReactNode } from 'react';

type Props = {
	children: ReactNode;
};

export function LayoutHeaderTitle( { children }: Props ) {
	return <h1 className="jetpack-cloud-layout__header-title">{ children }</h1>;
}

export function LayoutHeaderSubtitle( { children }: Props ) {
	return <h2 className="jetpack-cloud-layout__header-subtitle">{ children }</h2>;
}

export function LayoutHeaderActions( { children }: Props ) {
	return <h2 className="jetpack-cloud-layout__header-actions">{ children }</h2>;
}

export default function LayoutHeader( { children }: Props ) {
	const headerTitle = Children.toArray( children ).find(
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		( child: any ) => child.type === LayoutHeaderTitle
	);

	const headerSubtitle = Children.toArray( children ).find(
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		( child: any ) => child.type === LayoutHeaderSubtitle
	);

	const headerActions = Children.toArray( children ).find(
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		( child: any ) => child.type === LayoutHeaderActions
	);

	return (
		<div className="jetpack-cloud-layout__header">
			<div className="jetpack-cloud-layout__header-main">
				{ headerTitle }
				{ headerSubtitle }
			</div>

			{ headerActions }
		</div>
	);
}
