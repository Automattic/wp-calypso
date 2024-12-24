import clsx from 'clsx';
import { Children, ReactNode, useLayoutEffect, useState } from 'react';
import Breadcrumb, { Item as BreadcrumbItem } from 'calypso/components/breadcrumb';
import useDetectWindowBoundary from 'calypso/lib/detect-window-boundary';

type Props = {
	showStickyContent?: boolean;
	children: ReactNode;
	className?: string;
	useColumnAlignment?: boolean;
};

export function LayoutHeaderTitle( { children }: Props ) {
	return <h1 className="multi-sites-dashboard-layout__header-title">{ children }</h1>;
}

export function LayoutHeaderSubtitle( { children }: Props ) {
	return <h2 className="multi-sites-dashboard-layout__header-subtitle">{ children }</h2>;
}

export function LayoutHeaderActions( { children, className, useColumnAlignment }: Props ) {
	const wrapperClass = clsx( className, 'multi-sites-dashboard-layout__header-actions', {
		'is-column-flex-align': useColumnAlignment,
	} );
	return <div className={ wrapperClass }>{ children }</div>;
}

export function LayoutHeaderBreadcrumb( {
	items,
	hideOnMobile,
}: {
	items: BreadcrumbItem[];
	hideOnMobile?: boolean;
} ) {
	return (
		<div
			className={ clsx( 'multi-sites-dashboard-layout__header-breadcrumb', {
				'is-hidden-on-mobile': hideOnMobile,
			} ) }
		>
			<Breadcrumb items={ items } />
		</div>
	);
}

export default function LayoutHeader( { showStickyContent, children, className }: Props ) {
	const headerBreadcrumb = Children.toArray( children ).find(
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		( child: any ) => child.type === LayoutHeaderBreadcrumb
	);

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

	const [ divRef, hasCrossed ] = useDetectWindowBoundary();

	const outerDivProps = divRef ? { ref: divRef as React.RefObject< HTMLDivElement > } : {};
	const wrapperClass = clsx( className, 'multi-sites-dashboard-layout__viewport' );

	const [ minHeaderHeight, setMinHeaderHeight ] = useState( 0 );

	// To avoid shifting the layout when displaying sticky content,  we will need to
	// keep track of our Header height and set it as the minimum viewport height.
	useLayoutEffect(
		() => {
			const headerRef = outerDivProps?.ref?.current;

			const updateMinHeaderHeight = () => {
				setMinHeaderHeight( headerRef?.clientHeight ?? 0 );
			};

			window.addEventListener( 'resize', updateMinHeaderHeight );

			updateMinHeaderHeight();

			return () => {
				window.removeEventListener( 'resize', updateMinHeaderHeight );
			};
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[]
	);

	return (
		<div
			className={ wrapperClass }
			{ ...outerDivProps }
			style={ showStickyContent ? { minHeight: `${ minHeaderHeight }px` } : {} }
		>
			<div
				className={ clsx( {
					'multi-sites-dashboard-layout__sticky-header': showStickyContent && hasCrossed,
				} ) }
			>
				<div
					className={ clsx( 'multi-sites-dashboard-layout__header', {
						'has-actions': !! headerActions,
					} ) }
				>
					<div className="multi-sites-dashboard-layout__header-main">
						{ headerBreadcrumb }
						{ headerTitle }
						{ headerSubtitle }
					</div>

					{ headerActions }
				</div>
			</div>
		</div>
	);
}
