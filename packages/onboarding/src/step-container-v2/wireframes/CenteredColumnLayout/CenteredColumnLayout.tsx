import { ReactNode } from 'react';
import { ContentRow } from '../../components/ContentRow/ContentRow';
import { ContentWrapper } from '../../components/ContentWrapper/ContentWrapper';
import { StepContainerV2 } from '../../components/StepContainerV2/StepContainerV2';
import { ContentProp } from '../../components/StepContainerV2/context';
import { StickyBottomBarRenderer } from '../../components/StickyBottomBar/StickyBottomBarRenderer';
import { isTopBar } from '../../components/TopBar/TopBar';
import { renderTopBar, TopBarRenderer } from '../../components/TopBar/TopBarRenderer';

interface CenteredColumnLayoutProps {
	topBar?: ContentProp;
	heading?: ReactNode;
	className?: string;
	children?: ContentProp;
	stickyBottomBar?: ContentProp;
	columnWidth: 4 | 5 | 6 | 8 | 10;
	verticalAlign?: 'center';
}

export const CenteredColumnLayout = ( {
	columnWidth,
	topBar,
	heading,
	className,
	children,
	stickyBottomBar,
	verticalAlign,
}: CenteredColumnLayoutProps ) => {
	return (
		<StepContainerV2
			initialTopBarHeight={
				// Calculate the top bar height on the server side to avoid layout shifts.
				typeof window === 'undefined' &&
				isTopBar(
					renderTopBar( topBar, {
						isLargeViewport: false,
						isSmallViewport: false,
					} )
				)
					? 'calc( var( --step-container-v2-top-bar-content-height ) + 2 * var( --step-container-v2-top-bar-padding ) )'
					: '0px'
			}
		>
			{ ( context ) => {
				const content = typeof children === 'function' ? children( context ) : children;

				return (
					<>
						<TopBarRenderer topBar={ topBar } />
						<ContentWrapper centerAligned={ verticalAlign === 'center' }>
							{ heading && <ContentRow columns={ 6 }>{ heading }</ContentRow> }
							<ContentRow columns={ columnWidth } className={ className }>
								{ content }
							</ContentRow>
						</ContentWrapper>
						<StickyBottomBarRenderer stickyBottomBar={ stickyBottomBar } />
					</>
				);
			} }
		</StepContainerV2>
	);
};
