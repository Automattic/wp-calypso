import { ReactNode } from 'react';
import { Content } from '../../components/Content/Content';
import { ContentWrapper } from '../../components/ContentWrapper/ContentWrapper';
import { StepContainerV2 } from '../../components/StepContainerV2/StepContainerV2';
import { ContentProp } from '../../components/StepContainerV2/context';
import { StickyBottomBarRenderer } from '../../components/StickyBottomBar/StickyBottomBarRenderer';
import { TopBarRenderer } from '../../components/TopBar/TopBarRenderer';

interface WideLayoutProps {
	topBar?: ContentProp;
	heading?: ReactNode;
	className?: string;
	children?: ContentProp;
	footer?: ReactNode;
	stickyBottomBar?: ContentProp;
	maxWidth?: React.ComponentProps< typeof ContentWrapper >[ 'maxWidth' ];

	/**
	 * @deprecated Do not use `hasContentPadding`. This was a special case for the checkout to support the background colors. It will be removed when checkout no longer needs it.
	 */
	hasContentPadding?: ContentProp< boolean >;
}

export const WideLayout = ( {
	topBar,
	heading,
	className,
	children,
	footer,
	stickyBottomBar,
	maxWidth = 'wide',
	hasContentPadding: hasContentPaddingProp = true,
}: WideLayoutProps ) => {
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
						<ContentWrapper hasPadding={ hasContentPadding } maxWidth={ maxWidth }>
							{ heading && <ContentWrapper.Row columns={ 6 }>{ heading }</ContentWrapper.Row> }
							<ContentWrapper.Row columns={ 12 }>
								<Content className={ className }>{ content }</Content>
							</ContentWrapper.Row>
							{ footer && <ContentWrapper.Row columns={ 12 }>{ footer }</ContentWrapper.Row> }
						</ContentWrapper>
						<StickyBottomBarRenderer stickyBottomBar={ stickyBottomBar } />
					</>
				);
			} }
		</StepContainerV2>
	);
};
