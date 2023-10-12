import { domainProductSlugs, getPlan } from '@automattic/calypso-products';
import { Gridicon } from '@automattic/components';
import formatCurrency from '@automattic/format-currency';
import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import QueryProductsList from 'calypso/components/data/query-products-list';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import usePlanPrices from 'calypso/my-sites/plans/hooks/use-plan-prices';
import { useSelector } from 'calypso/state';
import { getCurrentUserCurrencyCode } from 'calypso/state/currency-code/selectors';
import { getProductBySlug } from 'calypso/state/products-list/selectors';
import { LoadingPlaceHolder } from '../loading-placeholder';
import { DialogContainer, StyledButton } from './components';
import { DomainPlanDialogProps, MODAL_VIEW_EVENT_NAME } from '.';
import type { TranslateResult } from 'i18n-calypso';

export const Heading = styled.div`
	font-family: Recoleta;
	color: var( --studio-gray-100 );
	font-size: 22px;
	line-height: 26px;
	letter-spacing: 0.38px;
	margin-bottom: 12px;
	@media ( min-width: 780px ) {
		font-size: 32px;
		line-height: 40px;
		letter-spacing: -0.32px;
	}
`;

const List = styled.ul`
	list-style: none;
	margin: 20px 0 12px;
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
`;

const TextBox = styled.div< { fontSize?: number; bold?: boolean; color?: 'gray' } >`
	font-size: ${ ( { fontSize } ) => fontSize || 14 }px;
	font-weight: ${ ( { bold } ) => ( bold ? 600 : 400 ) };
	line-height: 20px;
	margin-bottom: 8px;
	color: ${ ( { color } ) => {
		if ( color === 'gray' ) {
			return 'var(--studio-gray-50)';
		}
		return 'var(--color-text)';
	} };
`;

const CrossIcon = styled( Gridicon )`
	color: #e53e3e;
`;

const LoadingPlaceHolderText = styled( LoadingPlaceHolder )`
	width: 80px;
	display: inline-block;
	border-radius: 0;
`;

function LazyDisplayText( {
	displayText = '',
	isLoading,
}: {
	displayText?: TranslateResult;
	isLoading: boolean;
} ) {
	return isLoading || ! displayText ? <LoadingPlaceHolderText /> : <>{ displayText }</>;
}

/**
 * Adds a dialog to the free plan selection flow that explains the benefits of the paid plan
 * The FreeFreeDialog can be read as the modal to show when you
 * 1 - Select the free subdomain (Or does not select a domain at all)
 * 2 - Select the free plan
 */
export function FreePlanFreeDomainDialog( {
	wpcomFreeDomainSuggestion,
	onFreePlanSelected,
	onPlanSelected,
	suggestedPlanSlug,
}: DomainPlanDialogProps ) {
	const translate = useTranslate();
	const currencyCode = useSelector( getCurrentUserCurrencyCode ) ?? 'USD';
	const domainRegistrationProduct = useSelector( ( state ) =>
		getProductBySlug( state, domainProductSlugs.DOTCOM_DOMAIN_REGISTRATION )
	);
	const domainProductCost = domainRegistrationProduct?.cost;
	const planTitle = getPlan( suggestedPlanSlug )?.getTitle();
	const monthlyPlanPriceObject = usePlanPrices( {
		planSlug: suggestedPlanSlug,
		returnMonthly: true,
	} );
	const annualPlanPriceObject = usePlanPrices( {
		planSlug: suggestedPlanSlug,
		returnMonthly: false,
	} );

	const monthlyPlanPrice =
		( monthlyPlanPriceObject.discountedRawPrice || monthlyPlanPriceObject.rawPrice ) ?? 0;
	const annualPlanPrice =
		( annualPlanPriceObject.discountedRawPrice || annualPlanPriceObject.rawPrice ) ?? 0;

	useEffect( () => {
		recordTracksEvent( MODAL_VIEW_EVENT_NAME, {
			dialog_type: 'free_plan_free_domain',
		} );
	}, [] );

	return (
		<DialogContainer>
			<QueryProductsList />
			<Heading id="free-plan-modal-title">{ translate( "Don't miss out" ) }</Heading>
			<TextBox id="free-plan-modal-description">
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
											displayText={ wpcomFreeDomainSuggestion?.result?.domain_name }
											isLoading={ wpcomFreeDomainSuggestion?.isLoading }
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
					<TextBox>
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
				{ planTitle &&
					translate(
						'Unlock {{strong}}all of{{/strong}} these features with a %(planTitle)s plan, starting at just %(planPrice)s/month, {{break}}{{/break}} with a 14-day money back guarantee.',
						{
							args: {
								planTitle,
								planPrice: formatCurrency( monthlyPlanPrice, currencyCode, {
									stripZeros: true,
								} ),
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
				<StyledButton
					className="free-plan-free-domain-dialog__plan-button is-upsell-modal-personal-plan"
					disabled={ wpcomFreeDomainSuggestion.isLoading || ! wpcomFreeDomainSuggestion.result }
					primary
					onClick={ () => {
						onPlanSelected();
					} }
				>
					{ planTitle &&
						translate( 'Get the %(planTitle)s plan', {
							args: {
								planTitle,
							},
						} ) }
				</StyledButton>

				<StyledButton
					className="free-plan-free-domain-dialog__plan-button is-upsell-modal-free-plan"
					disabled={ wpcomFreeDomainSuggestion.isLoading || ! wpcomFreeDomainSuggestion.result }
					onClick={ () => {
						onFreePlanSelected();
					} }
					borderless
					color="gray"
				>
					{ translate( 'Continue with Free' ) }
				</StyledButton>
			</ButtonRow>
			<TextBox fontSize={ 12 } color="gray">
				{ planTitle &&
					translate(
						'%(planTitle)s plan: %(monthlyPlanPrice)s per month, %(annualPlanPrice)s billed annually. Excluding taxes.',
						{
							args: {
								planTitle,
								monthlyPlanPrice: formatCurrency( monthlyPlanPrice, currencyCode, {
									stripZeros: true,
								} ),
								annualPlanPrice: formatCurrency( annualPlanPrice, currencyCode, {
									stripZeros: true,
								} ),
							},
						}
					) }
			</TextBox>
		</DialogContainer>
	);
}
