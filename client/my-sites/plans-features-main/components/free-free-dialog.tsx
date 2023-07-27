import { applyTestFiltersToPlansList, PLAN_PERSONAL } from '@automattic/calypso-products';
import { Button, Dialog, Gridicon } from '@automattic/components';
import { css, Global } from '@emotion/react';
import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';
import { formatCurrency } from 'calypso/../packages/format-currency/src';
import { SingleFreeDomainSuggestion } from 'calypso/my-sites/plan-features-2023-grid/types';
import { useSelector } from 'calypso/state';
import { getCurrentUserCurrencyCode } from 'calypso/state/currency-code/selectors';
import { getCurrentUserLocale } from 'calypso/state/current-user/selectors';
import { getPlanRawPrice } from 'calypso/state/plans/selectors';
import { useGetDotcomDomainSuggestion } from '../hooks/use-get-dotcom-domain-suggestion';
import { DialogContainer } from './free-plan-paid-domain-dialog';
import { LoadingPlaceHolder } from './loading-placeholder';

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

const TextBox = styled.div< { fontSize?: number; bold?: boolean; color?: string } >`
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

export const StyledButton = styled( Button )`
	padding: 10px 24px;
	border-radius: 4px;
	font-weight: 500;
	font-size: 14px;
	line-height: 20px;
	flex: 1;
	&.is-borderless {
		text-decoration: underline;
		border: none;
		font-weight: 600;
		padding: 0;
		color: ${ ( { color } ) => {
			if ( color === 'gray' ) {
				return 'var(--studio-gray-50)';
			}
			return 'var(--color-text)';
		} };
	}

	&.is-primary,
	&.is-primary.is-busy,
	&.is-primary:hover,
	&.is-primary:focus {
		background-color: var( --studio-blue-50 );
		border: unset;
	}

	&:hover {
		opacity: 0.85;
		transition: 0.7s;
	}
	&:focus {
		box-shadow: 0 0 0 2px var( --studio-white ), 0 0 0 4px var( --studio-blue-50 );
	}
	width: 100%;
	@media ( min-width: 780px ) {
		max-width: 260px;
		width: unset;
	}
`;

const CrossIcon = styled( Gridicon )`
	color: #e53e3e;
`;

const LoadingPlaceHolderText = styled( LoadingPlaceHolder )`
	width: 80px;
	display: inline-block;
	border-radius: 0;
`;

function DomainSuggestionText( { suggestion }: { suggestion: SingleFreeDomainSuggestion } ) {
	return suggestion.isLoading || ! suggestion?.entry?.domain_name ? (
		<LoadingPlaceHolderText />
	) : (
		<strong>"{ suggestion?.entry?.domain_name }"</strong>
	);
}

export function FreeFreeDialog( {
	freeSubdomain,
	onFreePlanSelected,
	onPlanSelected,
	onClose,
}: {
	freeSubdomain: string;
	onClose: () => void;
	onFreePlanSelected: () => void;
	onPlanSelected: () => void;
} ) {
	const translate = useTranslate();
	const userLocale = useSelector( getCurrentUserLocale );
	const currencyCode = useSelector( getCurrentUserCurrencyCode ) ?? 'USD';
	const { suggestion, invalidateDomainSuggestionCache } = useGetDotcomDomainSuggestion( {
		query: freeSubdomain,
		locale: userLocale,
	} );

	const planConstantObj = applyTestFiltersToPlansList( PLAN_PERSONAL, undefined );
	const planProductId = planConstantObj.getProductId();
	const rawPrice = useSelector( ( state ) => getPlanRawPrice( state, planProductId, true ) );

	return (
		<Dialog
			isBackdropVisible={ true }
			isVisible={ true }
			onClose={ onClose }
			showCloseIcon={ true }
		>
			<Global
				styles={ css`
					.dialog__backdrop.is-full-screen {
						background-color: rgba( 0, 0, 0, 0.6 );
					}
					.ReactModal__Content--after-open.dialog.card {
						border-radius: 4px;
						width: 605px;
					}
				` }
			/>
			<DialogContainer>
				<Heading>{ translate( "Don't miss out" ) }</Heading>
				<TextBox>
					{ translate( 'With a Free plan, you miss out on a lot of great features:' ) }
				</TextBox>
				<List>
					<ListItem>
						<div>
							<CrossIcon icon="cross" size={ 24 } />
						</div>
						<TextBox bold>
							No free custom domain: Your site will be shown to visitors as { freeSubdomain }
						</TextBox>
					</ListItem>
					<ListItem>
						<div>
							<CrossIcon icon="cross" size={ 24 } />
						</div>
						<TextBox bold>
							{ translate(
								'No ad-free experience: Your visitors will see external ads on your site.'
							) }
						</TextBox>
					</ListItem>
					<ListItem>
						<div>
							<CrossIcon icon="cross" size={ 24 } />
						</div>
						<TextBox bold>
							{ translate( 'No unlimited professional customer support (only community forums)' ) }
						</TextBox>
					</ListItem>
					<ListItem>
						<div>
							<CrossIcon icon="cross" size={ 24 } />
						</div>
						<TextBox bold>
							{ translate(
								'No extra storage. You only get 1GB for photos, videos, media, and documents.'
							) }
						</TextBox>
					</ListItem>
				</List>
				<TextBox>
					{ rawPrice &&
						translate(
							'Unlock these features with a Personal plan,starting at just %(planPrice)s/month, {{break}}{{/break}} with a 14-day money back guarantee.',
							{
								args: {
									planPrice: formatCurrency( rawPrice, currencyCode, {
										stripZeros: true,
									} ),
								},
								components: { break: <br /> },
							}
						) }
				</TextBox>
				<TextBox>
					{ translate(
						'As a bonus, you will get a custom domain like {{suggestion}}{{/suggestion}} {{break}}{{/break}} for free for one year (%(domainPrice)s value).',
						{
							components: {
								suggestion: <DomainSuggestionText suggestion={ suggestion } />,
								break: <br />,
							},
							args: {
								domainPrice: formatCurrency(
									suggestion?.entry?.raw_price ?? 0,
									suggestion?.entry?.currency_code ?? 'USD',
									{
										stripZeros: true,
									}
								),
							},
						}
					) }
				</TextBox>

				<ButtonRow>
					<StyledButton
						primary
						onClick={ () => {
							invalidateDomainSuggestionCache();
							onPlanSelected();
						} }
					>
						{ translate( 'Get the Personal plan' ) }
					</StyledButton>

					<StyledButton
						onClick={ () => {
							invalidateDomainSuggestionCache();
							onFreePlanSelected();
						} }
						borderless
						color="gray"
					>
						{ translate( 'Continue with Free' ) }
					</StyledButton>
				</ButtonRow>
				<TextBox fontSize={ 12 } color="gray">
					{ rawPrice &&
						translate(
							'Personal plan: %(planPrice)s per month, %(annualPlanPrice)s billed annually. Excluding taxes.',
							{
								args: {
									planPrice: formatCurrency( rawPrice, currencyCode, {
										stripZeros: true,
									} ),
									annualPlanPrice: formatCurrency( rawPrice * 12, currencyCode, {
										stripZeros: true,
									} ),
								},
							}
						) }
				</TextBox>
			</DialogContainer>
		</Dialog>
	);
}
