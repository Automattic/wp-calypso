import clsx from 'clsx';
import { Children, Fragment, isValidElement, ReactNode } from 'react';
import { Content } from '../../components/Content/Content';
import { ContentWrapper } from '../../components/ContentWrapper/ContentWrapper';
import { StepContainerV2 } from '../../components/StepContainerV2/StepContainerV2';
import { ContentProp } from '../../components/StepContainerV2/context';
import { StickyBottomBarRenderer } from '../../components/StickyBottomBar/StickyBottomBarRenderer';
import { TopBarRenderer } from '../../components/TopBar/TopBarRenderer';
import './style.scss';

interface TwoColumnLayoutProps {
	topBar?: ContentProp;
	heading?: ReactNode;
	className?: string;
	children?: ContentProp;
	footer?: ReactNode;
	stickyBottomBar?: ContentProp;
	firstColumnWidth: number;
	secondColumnWidth: number;
}

export const TwoColumnLayout = ( {
	firstColumnWidth,
	secondColumnWidth,
	children,
	topBar,
	heading,
	className,
	footer,
	stickyBottomBar,
}: TwoColumnLayoutProps ) => {
	const getChildFlexGrow = ( index: number ) => {
		switch ( index ) {
			case 0:
				return firstColumnWidth;
			case 1:
				return secondColumnWidth;
			default:
				return undefined;
		}
	};

	return (
		<StepContainerV2>
			{ ( context ) => {
				let childElements = typeof children === 'function' ? children( context ) : children;
				if ( isValidElement( childElements ) && childElements.type === Fragment ) {
					childElements = childElements.props.children;
				}

				childElements = Children.toArray( childElements )
					.filter( isValidElement )
					.map( ( child, index ) => (
						<div style={ { flex: getChildFlexGrow( index ) } } key={ index }>
							{ child }
						</div>
					) );

				return (
					<>
						<TopBarRenderer topBar={ topBar } />
						<ContentWrapper>
							{ heading }
							<Content
								className={ clsx( 'step-container-v2__content--two-column-layout', className ) }
							>
								{ childElements }
							</Content>
							{ footer }
						</ContentWrapper>
						<StickyBottomBarRenderer stickyBottomBar={ stickyBottomBar } />
					</>
				);
			} }
		</StepContainerV2>
	);
};
