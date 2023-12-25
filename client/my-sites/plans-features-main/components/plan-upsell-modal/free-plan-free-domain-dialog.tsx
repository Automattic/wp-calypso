import {
	domainProductSlugs,
	getPlan,
	type PlanSlug,
	PLAN_PREMIUM,
} from '@automattic/calypso-products';
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
import { getProductBySlug } from 'calypso/state/products-list/selectors';
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

// TODO:
// Replace `getPlanPrices` with the selectors from the Plans datastore.
const usePlanUpsellInfo = (
	planSlug: PlanSlug,
	currencyCode: string
): {
	title: TranslateResult;
	formattedPriceMonthly: string;
	formattedPriceFull: string;
} => {
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
		title,
		formattedPriceMonthly: formatCurrency( priceMonthly, currencyCode, { stripZeros: true } ),
		formattedPriceFull: formatCurrency( priceFull, currencyCode, { stripZeros: true } ),
	};
};

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
	const domainRegistrationProduct = useSelector( ( state ) =>
		getProductBySlug( state, domainProductSlugs.DOTCOM_DOMAIN_REGISTRATION )
	);
	const currencyCode = useSelector( getCurrentUserCurrencyCode ) ?? 'USD';
	const domainProductCost = domainRegistrationProduct?.cost;
	const primaryUpsellPlanInfo = usePlanUpsellInfo( suggestedPlanSlug, currencyCode );
	const secondaryUpsellPlanInfo = usePlanUpsellInfo( PLAN_PREMIUM, currencyCode );
	const buttonDisabled = generatedWPComSubdomain.isLoading || ! generatedWPComSubdomain.result;

	useEffect( () => {
		recordTracksEvent( MODAL_VIEW_EVENT_NAME, {
			dialog_type: 'free_plan_free_domain',
		} );
	}, [] );

	return (
		<DialogContainer>
			<QueryProductsList />
			<Heading id="plan-upsell-modal-title">{ translate( "Don't miss out" ) }</Heading>
			<TextBox id="plan-upsell-modal-description">
				{ translate( "With a Free plan, you'll miss out on a lot of great features:" ) }
			</TextBox>
			<List>
				<ListItem>
					<div>
						<CrossIcon icon="cross" size={ 24 } />
					</div>
					<TextBox>
						{ translate(
							'{{strong}}No free custom domain:{{/strong}} Your site will be shown to visitors as {{strong}}{{subdomain}}{{/subdomain}}{{/strong}}',
							{
								components: {
									strong: <strong></strong>,
									subdomain: (
										<LazyDisplayText
											displayText={ generatedWPComSubdomain?.result?.domain_name }
											isLoading={ generatedWPComSubdomain?.isLoading }
										/>
									),
								},
							}
						) }
					</TextBox>
				</ListItem>
				<ListItem>
					<div>
						<CrossIcon icon="cross" size={ 24 } />
					</div>
					<TextBox>
						{ translate(
							'{{strong}}No ad-free experience:{{/strong}} Your visitors will see external ads on your site.',
							{
								components: { strong: <strong></strong> },
							}
						) }
					</TextBox>
				</ListItem>
				<ListItem>
					<div>
						<CrossIcon icon="cross" size={ 24 } />
					</div>
					<TextBox>
						{ translate(
							'{{strong}}No unlimited professional customer support{{/strong}} (only community forums)',
							{
								components: { strong: <strong></strong> },
							}
						) }
					</TextBox>
				</ListItem>
				<ListItem>
					<div>
						<CrossIcon icon="cross" size={ 24 } />
					</div>
					<TextBox noBottomGap>
						{ translate(
							'{{strong}}No extra storage:{{/strong}} You only get 1GB for photos, videos, media, and documents.',
							{
								components: { strong: <strong></strong> },
							}
						) }
					</TextBox>
				</ListItem>
			</List>
			<TextBox>
				{ translate(
					'Unlock {{strong}}all of{{/strong}} these features with a %(planTitle)s plan, starting at just %(planPrice)s/month, {{break}}{{/break}} with a 14-day money back guarantee.',
					{
						args: {
							planTitle: primaryUpsellPlanInfo.title,
							planPrice: primaryUpsellPlanInfo.formattedPriceMonthly,
						},
						components: { break: <br />, strong: <strong></strong> },
					}
				) }
			</TextBox>
			<TextBox>
				{ domainProductCost &&
					translate(
						'As a bonus, you will get a custom domain - like {{strong}}{{italic}}yourgroovydomain.com{{/italic}}{{/strong}} - {{break}}{{/break}} free for the first year (%(domainPrice)s value).',
						{
							args: {
								domainPrice: formatCurrency( domainProductCost, currencyCode, {
									stripZeros: true,
								} ),
							},
							components: {
								strong: <strong></strong>,
								italic: <i></i>,
								break: <br />,
							},
						}
					) }
			</TextBox>

			<ButtonRow>
				<PlanButton
					planSlug={ suggestedPlanSlug }
					disabled={ buttonDisabled }
					onClick={ () => {
						onPlanSelected( suggestedPlanSlug );
					} }
				>
					{ translate( 'Get the %(planTitle)s plan', {
						args: {
							planTitle: primaryUpsellPlanInfo.title,
						},
					} ) }
				</PlanButton>
				<PlanButton
					planSlug={ PLAN_PREMIUM }
					disabled={ buttonDisabled }
					onClick={ () => {
						onPlanSelected( PLAN_PREMIUM );
					} }
				>
					{ translate( 'Get the %(planTitle)s plan', {
						args: {
							planTitle: secondaryUpsellPlanInfo.title,
						},
					} ) }
				</PlanButton>
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
					'%(planTitle)s plan: %(monthlyPlanPrice)s per month, %(annualPlanPrice)s billed annually. Excluding taxes.',
					{
						args: {
							planTitle: primaryUpsellPlanInfo.title,
							monthlyPlanPrice: primaryUpsellPlanInfo.formattedPriceMonthly,
							annualPlanPrice: primaryUpsellPlanInfo.formattedPriceFull,
						},
					}
				) }
			</TextBox>
		</DialogContainer>
	);
}
