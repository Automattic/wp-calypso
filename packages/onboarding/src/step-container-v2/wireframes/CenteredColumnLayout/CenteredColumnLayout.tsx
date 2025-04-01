import clsx from 'clsx';
import { ReactNode } from 'react';
import { Content } from '../../components/Content/Content';
import { ContentWrapper } from '../../components/ContentWrapper/ContentWrapper';
import { StepContainerV2 } from '../../components/StepContainerV2/StepContainerV2';
import { ContentProp } from '../../components/StepContainerV2/context';
import { StickyBottomBarRenderer } from '../../components/StickyBottomBar/StickyBottomBarRenderer';
import { TopBarRenderer } from '../../components/TopBar/TopBarRenderer';

import './style.scss';

interface CenteredColumnLayoutProps {
	topBar?: ContentProp;
	heading?: ReactNode;
	className?: string;
	children?: ContentProp;
	footer?: ReactNode;
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
	footer,
	stickyBottomBar,
	verticalAlign,
}: CenteredColumnLayoutProps ) => {
	return (
		<StepContainerV2>
			{ ( context ) => {
				const content = typeof children === 'function' ? children( context ) : children;

				return (
					<>
						<TopBarRenderer topBar={ topBar } />
						<ContentWrapper centerAligned={ context.isSmallViewport && verticalAlign === 'center' }>
							{ heading }
							<Content
								className={ clsx(
									'step-container-v2__content--centered-column-layout',
									`step-container-v2__content--centered-column-layout-${ columnWidth }`,
									className
								) }
							>
								{ content }
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
