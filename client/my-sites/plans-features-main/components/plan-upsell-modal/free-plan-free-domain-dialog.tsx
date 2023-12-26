import { getPlan, type PlanSlug, PLAN_PREMIUM } from '@automattic/calypso-products';
import { Gridicon, LoadingPlaceholder } from '@automattic/components';
import formatCurrency from '@automattic/format-currency';
import styled from '@emotion/styled';
import { useEffect } from '@wordpress/element';
import { useTranslate } from 'i18n-calypso';
import QueryProductsList from 'calypso/components/data/query-products-list';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import PlanButton from 'calypso/my-sites/plans-grid/components/plan-button';
import { useSelector } from 'calypso/state';
import { getCurrentUserCurrencyCode } from 'calypso/state/currency-code/selectors';
import { getPlanPrices } from 'calypso/state/plans/selectors/get-plan-prices';
import getSelectedSiteId from 'calypso/state/ui/selectors/get-selected-site-id';
import { DialogContainer, Heading } from './components';
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
	@media ( min-width: 780px ) {
		flex-direction: row;
	}
`;

type TextBoxProps = {
	fontSize?: number;
	bold?: boolean;
	color?: 'gray';
	noBottomGap?: boolean;
};
const TextBox = styled.div< TextBoxProps >`
	font-size: ${ ( { fontSize } ) => fontSize || 14 }px;
	font-weight: ${ ( { bold } ) => ( bold ? 600 : 400 ) };
	line-height: 20px;
	color: ${ ( { color } ) => {
		if ( color === 'gray' ) {
			return 'var(--studio-gray-50)';
		}
		return 'var(--color-text)';
	} };
	margin-bottom: ${ ( { noBottomGap } ) => ( noBottomGap ? 0 : '8px' ) };
`;

const CrossIcon = styled( Gridicon )`
	color: #e53e3e;
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

type PlanUpsellInfo = {
	planSlug: PlanSlug;
	title: TranslateResult;
	formattedPriceMonthly: string;
	formattedPriceFull: string;
};

// TODO:
// Replace `getPlanPrices` with the selectors from the Plans datastore.
const usePlanUpsellInfo = ( planSlug: PlanSlug, currencyCode: string ): PlanUpsellInfo => {
	const title = getPlan( planSlug )?.getTitle() || '';
	const priceMonthly = useSelector( ( state ) => {
		const siteId = getSelectedSiteId( state ) ?? null;
		const rawPlanPrices = getPlanPrices( state, {
			planSlug,
			siteId,
			returnMonthly: true,
		} );
		return ( rawPlanPrices.discountedRawPrice || rawPlanPrices.rawPrice ) ?? 0;
	} );
	const priceFull = useSelector( ( state ) => {
		const siteId = getSelectedSiteId( state ) ?? null;
		const rawPlanPrices = getPlanPrices( state, {
			planSlug,
			siteId,
			returnMonthly: false,
		} );
		return ( rawPlanPrices.discountedRawPrice || rawPlanPrices.rawPrice ) ?? 0;
	} );

	return {
		planSlug,
		title,
		formattedPriceMonthly: formatCurrency( priceMonthly, currencyCode, { stripZeros: true } ),
		formattedPriceFull: formatCurrency( priceFull, currencyCode, { stripZeros: true } ),
	};
};

function PlanUpsellButton( {
	planUpsellInfo,
	onPlanSelected,
	disabled = false,
}: {
	planUpsellInfo: PlanUpsellInfo;
	onPlanSelected: ( planSlug: PlanSlug ) => void;
	disabled?: boolean;
} ) {
	const translate = useTranslate();

	return (
		<PlanButton
			planSlug={ planUpsellInfo.planSlug }
			disabled={ disabled }
			onClick={ () => {
				onPlanSelected( planUpsellInfo.planSlug );
			} }
		>
			{ translate( 'Get %(planTitle)s - %(planPrice)s/month', {
				comment: 'Eg: Get Personal $4/month',
				args: {
					planTitle: planUpsellInfo.title,
					planPrice: planUpsellInfo.formattedPriceMonthly,
				},
			} ) }
		</PlanButton>
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
	suggestedPlanSlug,
}: DomainPlanDialogProps ) {
	const translate = useTranslate();
	const currencyCode = useSelector( getCurrentUserCurrencyCode ) ?? 'USD';
	const primaryUpsellPlanInfo = usePlanUpsellInfo( suggestedPlanSlug, currencyCode );
	const secondaryUpsellPlanInfo = usePlanUpsellInfo( PLAN_PREMIUM, currencyCode );
	const buttonDisabled = generatedWPComSubdomain.isLoading || ! generatedWPComSubdomain.result;

	useEffect( () => {
		recordTracksEvent( MODAL_VIEW_EVENT_NAME, {
			dialog_type: 'free_plan_free_domain',
		} );
	}, [] );

	const featureUpsells = [
		translate(
			'No free custom domain: Your site will be shown to visitors as {{strong}}{{subdomain}}{{/subdomain}}{{/strong}}',
			{
				components: {
					subdomain: (
						<LazyDisplayText
							displayText={ generatedWPComSubdomain?.result?.domain_name }
							isLoading={ generatedWPComSubdomain?.isLoading }
						/>
					),
					strong: <strong></strong>,
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
			<TextBox id="plan-upsell-modal-description">
				{ translate( 'With a Free plan, you miss out on a lot of great features:' ) }
			</TextBox>
			<List>
				{ featureUpsells.map( ( upsellItem ) => (
					<ListItem>
						<div>
							<CrossIcon icon="cross" size={ 24 } />
						</div>
						<TextBox>{ upsellItem }</TextBox>
					</ListItem>
				) ) }
			</List>
			<TextBox>
				{ translate(
					'Unlock all of these features with a %(planTitle)s plan, starting at just %(planPrice)s/month.',
					{
						args: {
							planTitle: primaryUpsellPlanInfo.title,
							planPrice: primaryUpsellPlanInfo.formattedPriceMonthly,
						},
					}
				) }
			</TextBox>
			<TextBox>
				{ translate(
					'{{strong}}Need premium themes, live chat support, and advanced design tools?{{/strong}}{{break}}{{/break}}Go with our %(planTitle)s plan, starting at just %(planPrice)s/month. All annual plans come with a 14-day money-back guarantee.',
					{
						args: {
							planTitle: secondaryUpsellPlanInfo.title,
							planPrice: secondaryUpsellPlanInfo.formattedPriceMonthly,
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
					planUpsellInfo={ primaryUpsellPlanInfo }
					disabled={ buttonDisabled }
					onPlanSelected={ onPlanSelected }
				/>
				<PlanUpsellButton
					planUpsellInfo={ secondaryUpsellPlanInfo }
					disabled={ buttonDisabled }
					onPlanSelected={ onPlanSelected }
				/>
			</ButtonRow>
			<ButtonRow>
				<PlanButton
					disabled={ buttonDisabled }
					onClick={ () => {
						onFreePlanSelected();
					} }
					borderless
				>
					{ translate( 'Continue with Free' ) }
				</PlanButton>
			</ButtonRow>
			<TextBox fontSize={ 12 } color="gray" noBottomGap>
				{ translate(
					'%(planTitle1)s plan: %(monthlyPlanPrice1)s/mo, %(annualPlanPrice1)s billed annually. %(planTitle2)s plan: %(monthlyPlanPrice2)s/mo, %(annualPlanPrice2)s billed annually. Excluding taxes.',
					{
						args: {
							planTitle1: primaryUpsellPlanInfo.title,
							monthlyPlanPrice1: primaryUpsellPlanInfo.formattedPriceMonthly,
							annualPlanPrice1: primaryUpsellPlanInfo.formattedPriceFull,
							planTitle2: secondaryUpsellPlanInfo.title,
							monthlyPlanPrice2: secondaryUpsellPlanInfo.formattedPriceMonthly,
							annualPlanPrice2: secondaryUpsellPlanInfo.formattedPriceFull,
						},
					}
				) }
			</TextBox>
		</DialogContainer>
	);
}
