import { ComponentProps } from 'react';
import { StepContainerV2 } from '../../step-container-v2';

import './style.scss';

type HorizontalStepLayoutProps = Omit<
	ComponentProps< typeof StepContainerV2 >,
	'heading' | 'render'
> & {
	heading?: {
		text: string;
		subText?: string;
		imageUrl?: string;
	};
	leftContent?: ComponentProps< typeof StepContainerV2 >[ 'render' ];
	rightContent?: ComponentProps< typeof StepContainerV2 >[ 'render' ];
};

export const HorizontalStepLayout = ( {
	heading,
	leftContent,
	rightContent,
	...props
}: HorizontalStepLayoutProps ) => (
	<StepContainerV2
		{ ...props }
		className="horizontal-step-layout"
		heading={
			heading && {
				text: heading.text,
				subText: heading.subText,
				align: 'left',
				customPlacement: true,
			}
		}
		render={ ( { isSmallScreen, heading: headingElement, nextButton } ) => {
			const leftContentElement = leftContent?.( { isSmallScreen, nextButton } );
			const rightContentElement = rightContent?.( { isSmallScreen, nextButton } );

			return (
				<>
					<div
						style={ {
							display: 'flex',
							flexDirection: 'column',
							alignItems: 'flex-start',
						} }
					>
						{ headingElement }
						{ heading?.imageUrl && ! isSmallScreen && (
							<img
								src={ heading.imageUrl }
								style={ { height: '125px', width: 'auto', marginTop: '64px' } }
								alt=""
							/>
						) }
						{ leftContentElement }
					</div>
					{ rightContentElement && <div>{ rightContentElement }</div> }
				</>
			);
		} }
	/>
);
