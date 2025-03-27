import { Step } from '@automattic/onboarding';
import { Button } from '@wordpress/components';
import { chevronDown, chevronUp } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { ReactNode } from 'react';
import AsyncLoad from 'calypso/components/async-load';
import { LoadingEllipsis } from 'calypso/components/loading-ellipsis';
import { DIFMFAQ } from 'calypso/my-sites/marketing/do-it-for-me/faq';
import { DIFMServiceDescription } from 'calypso/my-sites/marketing/do-it-for-me/service-description';
import { useDIFMHeading } from 'calypso/my-sites/marketing/do-it-for-me/use-difm-heading';

import './style.scss';

export const StepContainerV2DIFMStartingPoint = ( {
	topBar,
	siteId,
	stickyBottomBar,
	primaryButton,
	secondaryButton,
}: {
	topBar: ReactNode;
	stickyBottomBar: ReactNode;
	primaryButton: ReactNode;
	siteId?: number;
	secondaryButton?: ReactNode;
} ) => {
	const translate = useTranslate();

	const { headerText, subHeaderText } = useDIFMHeading( {
		isStoreFlow: false,
		siteId,
	} );

	const ctas = (
		<>
			{ primaryButton }
			{ secondaryButton && <span>{ translate( 'or' ) }</span> }
			{ secondaryButton }
		</>
	);

	return (
		<Step.TwoColumnLayout
			className="step-container-v2--difm-starting-point"
			firstColumnWidth={ 1 }
			secondColumnWidth={ 1 }
			topBar={ topBar }
			stickyBottomBar={ stickyBottomBar }
			footer={
				<DIFMFAQ
					isStoreFlow={ false }
					siteId={ siteId }
					ctaSection={ ctas }
					renderExpanderButton={ ( { ref, onClick, isFAQSectionOpen, children } ) => {
						return (
							<Button
								className="step-container-v2--difm-starting-point__faq-expander"
								variant="secondary"
								ref={ ref }
								onClick={ onClick }
								icon={ isFAQSectionOpen ? chevronUp : chevronDown }
								iconPosition="right"
								iconSize={ 18 }
							>
								{ children }
							</Button>
						);
					} }
				/>
			}
		>
			{ ( { isSmallViewport, isLargeViewport } ) => {
				return (
					<>
						<div className="step-container-v2--difm-starting-point__left-column">
							<Step.Heading text={ headerText } subText={ subHeaderText } align="left" />
							<DIFMServiceDescription isStoreFlow={ false } />
							{ isSmallViewport && (
								<div className="step-container-v2--difm-starting-point__ctas">{ ctas }</div>
							) }
						</div>
						{ isLargeViewport && (
							<div className="step-container-v2--difm-starting-point__right-column">
								<AsyncLoad
									require="calypso/my-sites/marketing/do-it-for-me/site-build-showcase"
									placeholder={ <LoadingEllipsis /> }
									isStoreFlow={ false }
								/>
							</div>
						) }
					</>
				);
			} }
		</Step.TwoColumnLayout>
	);
};
