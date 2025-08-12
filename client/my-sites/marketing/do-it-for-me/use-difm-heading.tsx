import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';
import { useDIFMPlanInfo } from './use-difm-plan-info';

const Placeholder = styled.span`
	padding: 0 60px;
	animation: loading-fade 800ms ease-in-out infinite;
	background-color: var( --color-neutral-10 );
	color: transparent;
	min-height: 20px;
	@keyframes loading-fade {
		0% {
			opacity: 0.5;
		}
		50% {
			opacity: 1;
		}
		100% {
			opacity: 0.5;
		}
	}
`;

export const useDIFMHeading = ( {
	isStoreFlow,
	siteId,
}: {
	isStoreFlow: boolean;
	siteId?: number;
} ) => {
	const translate = useTranslate();

	const { planTitle, hasPriceDataLoaded, hasCurrentPlanOrHigherPlan, displayCost } =
		useDIFMPlanInfo( {
			isStoreFlow,
			siteId,
		} );

	const headerTextTranslateArgs = {
		components: {
			PriceWrapper: ! hasPriceDataLoaded ? <Placeholder /> : <span />,
		},
		args: {
			displayCost,
			days: 4,
		},
	};

	const headerText = isStoreFlow
		? translate(
				'Let us build your store in %(days)d days for {{PriceWrapper}}%(displayCost)s{{/PriceWrapper}}',
				headerTextTranslateArgs
		  )
		: translate(
				'Let us build your site in %(days)d days for {{PriceWrapper}}%(displayCost)s{{/PriceWrapper}}',
				headerTextTranslateArgs
		  );

	const subHeaderText = hasCurrentPlanOrHigherPlan
		? translate(
				"It's a one time fee. A WordPress.com professional will create layouts for up to %(freePages)d pages of your site. It only takes 4 simple steps:",
				{
					args: {
						freePages: 5,
					},
				}
		  )
		: translate(
				"It's a one time fee, plus an additional purchase of the %(plan)s plan. A WordPress.com professional will create layouts for up to %(freePages)d pages of your site. It only takes 4 simple steps:",
				{
					args: {
						plan: planTitle ?? '',
						freePages: 5,
					},
				}
		  );

	return {
		headerText,
		subHeaderText,
	};
};
