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
	className?: string;
	children?: ContentProp;
	stickyBottomBar?: ContentProp;

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
	stickyBottomBar,
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
						<ContentWrapper hasPadding={ hasContentPadding }>
							{ heading && <ContentRow columns={ 6 }>{ heading }</ContentRow> }
							<ContentRow className={ className }>{ content }</ContentRow>
						</ContentWrapper>
						<StickyBottomBarRenderer stickyBottomBar={ stickyBottomBar } />
					</>
				);
			} }
		</StepContainerV2>
	);
};
