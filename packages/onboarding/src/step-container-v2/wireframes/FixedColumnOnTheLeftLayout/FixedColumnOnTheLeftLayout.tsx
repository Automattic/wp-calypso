import { ComponentProps, ReactNode } from 'react';
import { ContentRow } from '../../components/ContentRow/ContentRow';
import { ContentWrapper } from '../../components/ContentWrapper/ContentWrapper';
import { Heading } from '../../components/Heading/Heading';
import { StepContainerV2 } from '../../components/StepContainerV2/StepContainerV2';
import { ContentProp } from '../../components/StepContainerV2/context';
import { StickyBottomBarRenderer } from '../../components/StickyBottomBar/StickyBottomBarRenderer';
import { TopBarRenderer } from '../../components/TopBar/TopBarRenderer';
import './style.scss';

interface FixedColumnOnTheLeftLayoutProps {
	topBar?: ContentProp;
	heading?: ReactNode;
	footer?: ReactNode;
	children: [ ContentProp, ContentProp ];
	stickyBottomBar?: ContentProp;
	fixedColumnWidth: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
}

const FixedColumnOnTheLeftLayout = ( {
	fixedColumnWidth,
	children,
	topBar,
	heading,
	footer,
	stickyBottomBar,
}: FixedColumnOnTheLeftLayoutProps ) => {
	return (
		<StepContainerV2>
			{ ( context ) => {
				const [ fixedColumn, secondColumn ] = children.map( ( child ) => {
					if ( typeof child === 'function' ) {
						return child( context );
					}
					return child;
				} );

				return (
					<>
						<TopBarRenderer topBar={ topBar } />
						<ContentWrapper
							axisDirection={ context.isLargeViewport ? 'horizontal' : 'vertical' }
							noTopPadding={ context.isLargeViewport }
						>
							<ContentRow
								columns={ context.isLargeViewport ? fixedColumnWidth : undefined }
								stretched
								className="step-container-v2--fixed-column-on-the-left-layout__fixed-column"
							>
								{ heading }
								{ fixedColumn }
								{ footer }
							</ContentRow>
							<ContentRow stretched>{ secondColumn }</ContentRow>
						</ContentWrapper>
						<StickyBottomBarRenderer stickyBottomBar={ stickyBottomBar } />
					</>
				);
			} }
		</StepContainerV2>
	);
};

// eslint-disable-next-line react/display-name
FixedColumnOnTheLeftLayout.Heading = ( props: ComponentProps< typeof Heading > ) => (
	<Heading { ...props } align="left" size="small" />
);

export { FixedColumnOnTheLeftLayout };
