import clsx from 'clsx';
import { Children, Fragment, isValidElement, ReactNode } from 'react';
import { ContentRow } from '../../components/ContentRow/ContentRow';
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
							{ heading && <ContentRow columns={ 6 }>{ heading }</ContentRow> }
							<ContentRow
								columns={ 10 }
								className={ clsx( 'step-container-v2__content-row--two-column-layout', className ) }
							>
								{ childElements }
							</ContentRow>
							{ footer && <ContentRow columns={ 6 }>{ footer }</ContentRow> }
						</ContentWrapper>
						<StickyBottomBarRenderer stickyBottomBar={ stickyBottomBar } />
					</>
				);
			} }
		</StepContainerV2>
	);
};
