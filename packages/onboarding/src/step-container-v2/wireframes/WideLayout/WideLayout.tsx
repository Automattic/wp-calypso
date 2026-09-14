import { ReactNode } from 'react';
import { ContentRow } from '../../components/ContentRow/ContentRow';
import { ContentWrapper } from '../../components/ContentWrapper/ContentWrapper';
import { StepContainerV2 } from '../../components/StepContainerV2/StepContainerV2';
import { ContentProp } from '../../components/StepContainerV2/context';
import { StickyBottomBarRenderer } from '../../components/StickyBottomBar/StickyBottomBarRenderer';
import { TopBarRenderer } from '../../components/TopBar/TopBarRenderer';

interface WideLayoutProps {
	topBar?: ContentProp;
	heading?: ReactNode;
	headingColumnWidth?: 4 | 5 | 6 | 8 | 10;
	className?: string;
	children?: ContentProp;
	stickyBottomBar?: ContentProp;
}

export const WideLayout = ( {
	topBar,
	heading,
	headingColumnWidth,
	className,
	children,
	stickyBottomBar,
}: WideLayoutProps ) => {
	return (
		<StepContainerV2>
			{ ( context ) => {
				const content = typeof children === 'function' ? children( context ) : children;

				return (
					<>
						<TopBarRenderer topBar={ topBar } />
						<ContentWrapper>
							{ heading && <ContentRow columns={ headingColumnWidth }>{ heading }</ContentRow> }
							<ContentRow className={ className }>{ content }</ContentRow>
						</ContentWrapper>
						<StickyBottomBarRenderer stickyBottomBar={ stickyBottomBar } />
					</>
				);
			} }
		</StepContainerV2>
	);
};
