import { ReactNode } from 'react';
import { Content } from '../../components/Content/Content';
import { ContentWrapper } from '../../components/ContentWrapper/ContentWrapper';
import { StepContainerV2 } from '../../components/StepContainerV2/StepContainerV2';
import { ContentProp } from '../../components/StepContainerV2/context';
import { StickyBottomBarRenderer } from '../../components/StickyBottomBar/StickyBottomBarRenderer';
import { TopBarRenderer } from '../../components/TopBar/TopBarRenderer';

interface FullWidthLayoutProps {
	topBar?: ContentProp;
	heading?: ReactNode;
	className?: string;
	children?: ContentProp;
	footer?: ReactNode;
	stickyBottomBar?: ContentProp;
	hasContentPadding?: ContentProp< boolean >;
}

export const FullWidthLayout = ( {
	topBar,
	heading,
	className,
	children,
	footer,
	stickyBottomBar,
	hasContentPadding: hasContentPaddingProp = true,
}: FullWidthLayoutProps ) => {
	return (
		<StepContainerV2>
			{ ( context ) => {
				const content = typeof children === 'function' ? children( context ) : children;

				const hasContentPadding =
					typeof hasContentPaddingProp === 'function'
						? hasContentPaddingProp( context )
						: hasContentPaddingProp;

				return (
					<>
						<TopBarRenderer topBar={ topBar } />
						<ContentWrapper hasPadding={ hasContentPadding } width="full">
							{ heading }
							<Content className={ className }>{ content }</Content>
							{ footer }
						</ContentWrapper>
						<StickyBottomBarRenderer stickyBottomBar={ stickyBottomBar } />
					</>
				);
			} }
		</StepContainerV2>
	);
};
