import { domainProductSlugs, getPlan } from '@automattic/calypso-products';
import formatCurrency from '@automattic/format-currency';
import { useEffect } from '@wordpress/element';
import { useTranslate } from 'i18n-calypso';
import QueryProductsList from 'calypso/components/data/query-products-list';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { useSelector } from 'calypso/state';
import { getCurrentUserCurrencyCode } from 'calypso/state/currency-code/selectors';
import { getProductBySlug } from 'calypso/state/products-list/selectors';
import { DialogContainer, Heading, StyledButton } from './components';
import {
	ButtonRow,
	CrossIcon,
	LazyDisplayText,
	List,
	ListItem,
	TextBox,
} from './components/upsell-components';
import { DomainPlanDialogProps, MODAL_VIEW_EVENT_NAME } from '.';

export default function MonthlyPlanDontMissOutDialog( {
	generatedWPComSubdomain,
	onFreePlanSelected,
	onPlanSelected,
	suggestedPlanSlug,
}: DomainPlanDialogProps ) {
	const translate = useTranslate();
	const monthlyPlanPrice = 10;
	const annualPlanPrice = 100;
	const currencyCode = useSelector( getCurrentUserCurrencyCode ) ?? 'USD';
	const domainRegistrationProduct = useSelector( ( state ) =>
		getProductBySlug( state, domainProductSlugs.DOTCOM_DOMAIN_REGISTRATION )
	);
	const domainProductCost = domainRegistrationProduct?.cost;
	const planTitle = getPlan( suggestedPlanSlug )?.getTitle();

	useEffect( () => {
		recordTracksEvent( MODAL_VIEW_EVENT_NAME, {
			dialog_type: 'custom_domain_and_free_plan',
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
					disabled={ generatedWPComSubdomain.isLoading || ! generatedWPComSubdomain.result }
					primary
					maxwidth="260px"
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
					disabled={ generatedWPComSubdomain.isLoading || ! generatedWPComSubdomain.result }
					onClick={ () => {
						onFreePlanSelected();
					} }
					borderless
					color="gray"
				>
					{ translate( 'Continue with Free' ) }
				</StyledButton>
			</ButtonRow>
			<TextBox fontSize={ 12 } color="gray" noBottomGap>
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
