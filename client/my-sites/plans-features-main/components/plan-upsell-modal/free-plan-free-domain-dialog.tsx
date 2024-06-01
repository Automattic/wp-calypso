import { PLAN_PERSONAL, PLAN_PREMIUM } from '@automattic/calypso-products';
import { Gridicon, LoadingPlaceholder } from '@automattic/components';
import { useHasEnTranslation } from '@automattic/i18n-utils';
import { PlanButton } from '@automattic/plans-grid-next';
import styled from '@emotion/styled';
import { useEffect } from '@wordpress/element';
import { useTranslate } from 'i18n-calypso';
import QueryProductsList from 'calypso/components/data/query-products-list';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { DialogContainer, Heading } from './components';
import PlanUpsellButton from './components/plan-upsell-button';
import { usePlanUpsellInfo } from './hooks/use-plan-upsell-info';
import { DomainPlanDialogProps, MODAL_VIEW_EVENT_NAME } from '.';
import type { TranslateResult } from 'i18n-calypso';

const List = styled.ul`
	list-style: none;
	margin: 20px 0 20px;
	font-weight: 600;
	font-size: 14px;
`;
const ListItem = styled.li`
	display: flex;
	& div:first-of-type {
		margin: 0 8px 0 8px;
	}
`;
const ButtonRow = styled.div`
	display: flex;
	justify-content: flex-start;
	margin: 16px 0;
	flex-direction: column;
	gap: 12px;

	@media ( min-width: 780px ) {
		flex-direction: row;
		justify-content: space-between;

		button {
			max-width: 282px;
		}
	}
`;

type TextBoxProps = {
	fontSize?: number;
	bold?: boolean;
	color?: 'gray';
	marginTop?: number;
	marginBottom?: number;
};
const TextBox = styled.p< TextBoxProps >`
	font-size: ${ ( { fontSize } ) => fontSize || 14 }px;
	font-weight: ${ ( { bold } ) => ( bold ? 600 : 400 ) };
	line-height: 1.5;
	color: ${ ( { color } ) => {
		if ( color === 'gray' ) {
			return 'var(--studio-gray-50)';
		}
		return 'var(--color-text)';
	} };
	margin-top: ${ ( { marginTop } ) => ( marginTop ? `${ marginTop }px` : 'inherit' ) };
	margin-bottom: ${ ( { marginBottom } ) => ( marginBottom ? `${ marginBottom }px` : 'inherit' ) };
	padding-bottom: 3px;
`;

const CrossIcon = styled( Gridicon )`
	color: #e53e3e;
	padding-top: 1px; // a brute-force way of aligning the icon and the sentence.
`;

function LazyDisplayText( {
	displayText = '',
	isLoading,
}: {
	displayText?: TranslateResult;
	isLoading: boolean;
} ) {
	return isLoading || ! displayText ? (
		<LoadingPlaceholder width="80px" minHeight="0px" height="8px" />
	) : (
		<>{ displayText }</>
	);
}

/**
 * Adds a dialog to the free plan selection flow that explains the benefits of the paid plan
 * The FreeFreeDialog can be read as the modal to show when you
 * 1 - Select the free subdomain (Or does not select a domain at all)
 * 2 - Select the free plan
 */
export function FreePlanFreeDomainDialog( {
	generatedWPComSubdomain,
	onFreePlanSelected,
	onPlanSelected,
}: DomainPlanDialogProps ) {
	const translate = useTranslate();
	const hasEnTranslation = useHasEnTranslation();
	const basicPlanUpsellInfo = usePlanUpsellInfo( { planSlug: PLAN_PERSONAL } );
	const advancePlanUpsellInfo = usePlanUpsellInfo( { planSlug: PLAN_PREMIUM } );
	const buttonDisabled = generatedWPComSubdomain.isLoading || ! generatedWPComSubdomain.result;

	useEffect( () => {
		recordTracksEvent( MODAL_VIEW_EVENT_NAME, {
			dialog_type: 'free_plan_free_domain',
		} );
	}, [] );

	const featureUpsells = [
		translate(
			'No free custom domain: Your site will be shown to visitors as {{subdomain}}{{/subdomain}}',
			{
				components: {
					subdomain: (
						<LazyDisplayText
							displayText={ generatedWPComSubdomain?.result?.domain_name }
							isLoading={ generatedWPComSubdomain?.isLoading }
						/>
					),
				},
			}
		),
		translate( 'No ad-free experience: Your visitors will see external ads on your site.' ),
		translate( 'No unlimited professional customer support (only community forums)' ),
		translate( 'No extra storage. You only get 1GB for photos, videos, media, and documents.' ),
		translate( 'Monetize your site through paid subscribers' ),
	];

	return (
		<DialogContainer>
			<QueryProductsList />
			<Heading id="plan-upsell-modal-title">{ translate( "Don't miss out" ) }</Heading>
			<TextBox id="plan-upsell-modal-description" marginTop={ 8 }>
				{ translate( 'With a Free plan, you miss out on a lot of great features:' ) }
			</TextBox>
			<List>
				{ featureUpsells.map( ( upsellItem ) => (
					<ListItem>
						<div>
							<CrossIcon icon="cross" size={ 20 } />
						</div>
						<TextBox bold>{ upsellItem }</TextBox>
					</ListItem>
				) ) }
			</List>
			<TextBox marginBottom={ 20 }>
				{ translate(
					'Unlock all of these features with a %(planTitle)s plan, starting at just %(planPrice)s/month.',
					{
						args: {
							planTitle: basicPlanUpsellInfo.title,
							planPrice: basicPlanUpsellInfo.formattedPriceMonthly,
						},
					}
				) }
			</TextBox>
			<TextBox>
				{ hasEnTranslation(
					'{{strong}}Need premium themes, fast support, and advanced design tools?{{/strong}}{{break}}{{/break}}Go with our %(planTitle)s plan, starting at just %(planPrice)s/month. All annual plans come with a 14-day money-back guarantee.'
				)
					? translate(
							'{{strong}}Need premium themes, fast support, and advanced design tools?{{/strong}}{{break}}{{/break}}Go with our %(planTitle)s plan, starting at just %(planPrice)s/month. All annual plans come with a 14-day money-back guarantee.',
							{
								args: {
									planTitle: advancePlanUpsellInfo.title,
									planPrice: advancePlanUpsellInfo.formattedPriceMonthly,
								},
								components: {
									strong: <strong></strong>,
									break: <br />,
								},
							}
					  )
					: translate(
							'{{strong}}Need premium themes, live chat support, and advanced design tools?{{/strong}}{{break}}{{/break}}Go with our %(planTitle)s plan, starting at just %(planPrice)s/month. All annual plans come with a 14-day money-back guarantee.',
							{
								args: {
									planTitle: advancePlanUpsellInfo.title,
									planPrice: advancePlanUpsellInfo.formattedPriceMonthly,
								},
								components: {
									strong: <strong></strong>,
									break: <br />,
								},
							}
					  ) }
			</TextBox>

			<ButtonRow>
				<PlanUpsellButton
					planSlug={ PLAN_PERSONAL }
					disabled={ buttonDisabled }
					onPlanSelected={ onPlanSelected }
				/>
				<PlanUpsellButton
					planSlug={ PLAN_PREMIUM }
					disabled={ buttonDisabled }
					onPlanSelected={ onPlanSelected }
				/>
			</ButtonRow>
			<PlanButton
				disabled={ buttonDisabled }
				onClick={ () => {
					onFreePlanSelected();
				} }
				borderless
			>
				{ translate( 'Continue with Free' ) }
			</PlanButton>
			<TextBox fontSize={ 12 } color="gray">
				{
					/* translators: /mo is the abbreviation form of "per month" */
					translate(
						'%(planTitle1)s plan: %(monthlyPlanPrice1)s/mo, %(annualPlanPrice1)s billed annually. %(planTitle2)s plan: %(monthlyPlanPrice2)s/mo, %(annualPlanPrice2)s billed annually. Excluding taxes.',
						{
							args: {
								planTitle1: basicPlanUpsellInfo.title,
								monthlyPlanPrice1: basicPlanUpsellInfo.formattedPriceMonthly,
								annualPlanPrice1: basicPlanUpsellInfo.formattedPriceFull,
								planTitle2: advancePlanUpsellInfo.title,
								monthlyPlanPrice2: advancePlanUpsellInfo.formattedPriceMonthly,
								annualPlanPrice2: advancePlanUpsellInfo.formattedPriceFull,
							},
						}
					)
				}
			</TextBox>
		</DialogContainer>
	);
}
