import { PlanSlug, getPlan } from '@automattic/calypso-products';
import { Button, Dialog } from '@automattic/components';
import { DomainSuggestions } from '@automattic/data-stores';
import { formatCurrency } from '@automattic/format-currency';
import { localizeUrl } from '@automattic/i18n-utils';
import { Global, css } from '@emotion/react';
import styled from '@emotion/styled';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import { useSelector } from 'calypso/state';
import { getCurrentUserCurrencyCode } from 'calypso/state/currency-code/selectors';
import usePlanPrices from '../../plans/hooks/use-plan-prices';
import useIsCustomDomainAllowedOnFreePlan from '../hooks/use-is-custom-domain-allowed-on-free-plan';
import { LoadingPlaceHolder } from './loading-placeholder';
import type { DomainSuggestion } from '@automattic/data-stores';

const DialogContainer = styled.div`
	padding: 24px;
`;

const Heading = styled.div`
	font-family: Recoleta;
	color: var( --studio-gray-100 );
	font-size: 22px;
	line-height: 26px;
	letter-spacing: 0.38px;
	@media ( min-width: 780px ) {
		font-size: 32px;
		line-height: 40px;
		letter-spacing: -0.32px;
	}
`;

const SubHeading = styled.div`
	margin-top: 8px;
	font-family: 'SF Pro Text', sans-serif;
	color: var( --studio-gray-60 );
	font-size: 14px;
	line-height: 20px;
	letter-spacing: -0.15px;
	@media ( min-width: 780px ) {
		font-size: 16px;
		line-height: 24px;
		letter-spacing: -0.1px;
	}
`;

const ButtonContainer = styled.div`
	display: flex;
	flex-direction: column;
	margin-top: 16px;
	@media ( min-width: 780px ) {
		margin-top: 24px;
	}
`;

const Row = styled.div`
	display: flex;
	justify-content: space-between;
	padding-top: 16px;
	flex-wrap: wrap;
	gap: 12px;
	flex-direction: column;
	@media ( min-width: 780px ) {
		flex-direction: row;
		align-items: center;
	}
`;

const RowWithBorder = styled( Row )`
	border-bottom: 1px solid rgba( 220, 220, 222, 0.64 );
	padding-bottom: 16px;
`;

const DomainName = styled.div`
	font-size: 16px;
	line-height: 20px;
	letter-spacing: -0.24px;
	color: var( --studio-gray-80 );
	overflow-wrap: break-word;
	max-width: 100%;
	@media ( min-width: 780px ) {
		max-width: 55%;
	}
`;

const FreeDomainText = styled.div`
	font-size: 14px;
	line-height: 20px;
	letter-spacing: -0.15px;
	color: var( --studio-green-50 );
	margin-top: 4px;
`;

const StyledButton = styled( Button )`
	padding: 10px 24px;
	border-radius: 4px;
	font-weight: 500;
	font-size: 14px;
	line-height: 20px;
	flex: 1;
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
		max-width: fit-content;
		width: unset;
	}
`;

function GetSuggestedPlanSection( {
	domainName,
	suggestedPlanSlug,
	onButtonClick,
	isBusy,
}: {
	domainName: string;
	suggestedPlanSlug: PlanSlug;
	onButtonClick: () => void;
	isBusy: boolean;
} ) {
	const translate = useTranslate();
	const planPrices = usePlanPrices( { planSlug: suggestedPlanSlug, returnMonthly: true } );
	const currencyCode = useSelector( getCurrentUserCurrencyCode );
	const planTitle = getPlan( suggestedPlanSlug )?.getTitle();

	return (
		<>
			<DomainName>
				<div>{ domainName }</div>
				<FreeDomainText>{ translate( 'Free for one year ' ) }</FreeDomainText>
			</DomainName>
			<StyledButton busy={ isBusy } primary onClick={ onButtonClick }>
				{ currencyCode &&
					translate( 'Get %(planTitle)s - %(planPrice)s/month', {
						comment: 'Eg: Get Personal - $4/month',
						args: {
							planTitle: planTitle as string,
							planPrice: formatCurrency(
								planPrices.discountedRawPrice || planPrices.rawPrice,
								currencyCode,
								{ stripZeros: true }
							),
						},
					} ) }
			</StyledButton>
		</>
	);
}

type DomainPlanDialogProps = {
	domainName: string;
	suggestedPlanSlug: PlanSlug;
	onFreePlanSelected: ( domainSuggestion?: DomainSuggestion ) => void;
	onPlanSelected: () => void;
};

const useWpComFreeDomainSuggestion = (
	domainName: string
): {
	isInitialLoading: boolean;
	wpcomFreeDomainSuggestion: DomainSuggestions.DomainSuggestion | undefined;
} => {
	const {
		data: wordPressSubdomainSuggestions,
		isInitialLoading,
		isError,
	} = DomainSuggestions.useGetWordPressSubdomain( domainName );

	return {
		isInitialLoading,
		wpcomFreeDomainSuggestion: ( ! isError && wordPressSubdomainSuggestions?.[ 0 ] ) || undefined,
	};
};

function DialogPaidPlanIsRequired( {
	domainName,
	suggestedPlanSlug,
	onFreePlanSelected,
	onPlanSelected,
}: DomainPlanDialogProps ) {
	const translate = useTranslate();
	const queryClient = useQueryClient();
	const [ isBusy, setIsBusy ] = useState( false );
	const { isInitialLoading, wpcomFreeDomainSuggestion } =
		useWpComFreeDomainSuggestion( domainName );

	function handlePaidPlanClick() {
		setIsBusy( true );
		onPlanSelected();
	}

	function handleFreeDomainClick() {
		setIsBusy( true );
		// Since this domain will not be available after it is selected, invalidate the cache.
		queryClient.invalidateQueries( DomainSuggestions.getDomainSuggestionsQueryKey( domainName ) );
		if ( wpcomFreeDomainSuggestion ) {
			onFreePlanSelected( wpcomFreeDomainSuggestion );
		}
	}

	return (
		<DialogContainer>
			<Heading>{ translate( 'A paid plan is required for your domain.' ) }</Heading>
			<SubHeading>
				{ translate(
					'Custom domains are only available with a paid plan. And they are free for the first year with an annual paid plan.'
				) }
			</SubHeading>
			<ButtonContainer>
				<RowWithBorder>
					<GetSuggestedPlanSection
						domainName={ domainName }
						suggestedPlanSlug={ suggestedPlanSlug }
						isBusy={ isBusy }
						onButtonClick={ handlePaidPlanClick }
					/>
				</RowWithBorder>
				<Row>
					<DomainName>
						{ isInitialLoading && <LoadingPlaceHolder /> }
						{ wpcomFreeDomainSuggestion && <div>{ wpcomFreeDomainSuggestion.domain_name }</div> }
					</DomainName>
					<StyledButton
						disabled={ isInitialLoading || ! wpcomFreeDomainSuggestion }
						busy={ isBusy }
						onClick={ handleFreeDomainClick }
					>
						{ translate( 'Continue with Free plan' ) }
					</StyledButton>
				</Row>
			</ButtonContainer>
		</DialogContainer>
	);
}

function DialogCustomDomainAndFreePlan( {
	domainName,
	suggestedPlanSlug,
	onFreePlanSelected,
	onPlanSelected,
}: DomainPlanDialogProps ) {
	const translate = useTranslate();
	const [ isBusy, setIsBusy ] = useState( false );
	const { isInitialLoading, wpcomFreeDomainSuggestion } =
		useWpComFreeDomainSuggestion( domainName );

	function handlePaidPlanClick() {
		setIsBusy( true );
		onPlanSelected();
	}

	function handleFreePlanClick() {
		setIsBusy( true );
		onFreePlanSelected();
	}

	return (
		<DialogContainer>
			<Heading>{ translate( 'A paid plan is required for a custom primary domain.' ) }</Heading>
			<SubHeading>
				{ translate(
					'Your custom domain can only be used as the primary domain with a paid plan and is free for the first year with an annual paid plan. For more details, please read {{a}}our support document{{/a}}.',
					{
						components: {
							a: (
								<a
									href={ localizeUrl(
										'https://wordpress.com/support/domains/set-a-primary-address/'
									) }
									target="_blank"
									rel="noreferrer"
								/>
							),
						},
					}
				) }
			</SubHeading>
			<ButtonContainer>
				<RowWithBorder>
					<GetSuggestedPlanSection
						domainName={ domainName }
						suggestedPlanSlug={ suggestedPlanSlug }
						isBusy={ isBusy }
						onButtonClick={ handlePaidPlanClick }
					/>
				</RowWithBorder>
				<Row>
					<DomainName>
						{ isInitialLoading && <LoadingPlaceHolder /> }
						{ wpcomFreeDomainSuggestion &&
							translate( '%(domainName)s redirects to %(wpcomFreeDomain)s', {
								args: {
									domainName,
									wpcomFreeDomain: wpcomFreeDomainSuggestion.domain_name,
								},
								comment: '%(wpcomFreeDomain)s is a WordPress.com subdomain, e.g. foo.wordpress.com',
							} ) }
					</DomainName>
					<StyledButton
						disabled={ isInitialLoading || ! wpcomFreeDomainSuggestion }
						busy={ isBusy }
						onClick={ handleFreePlanClick }
					>
						{ translate( 'Continue with Free plan' ) }
					</StyledButton>
				</Row>
			</ButtonContainer>
		</DialogContainer>
	);
}

export function FreePlanPaidDomainDialog( {
	domainName,
	suggestedPlanSlug,
	onFreePlanSelected,
	onPlanSelected,
	onClose,
}: DomainPlanDialogProps & { onClose: () => void } ) {
	const [ isLoadingAssignment, isCustomDomainAllowedOnFreePlan ] =
		useIsCustomDomainAllowedOnFreePlan( domainName );

	const dialogCommonProps: DomainPlanDialogProps = {
		domainName,
		suggestedPlanSlug,
		onFreePlanSelected,
		onPlanSelected,
	};

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
						width: 639px;
					}
				` }
			/>
			{ isLoadingAssignment && <LoadingPlaceHolder /> }
			{ ! isLoadingAssignment && isCustomDomainAllowedOnFreePlan ? (
				<DialogCustomDomainAndFreePlan { ...dialogCommonProps } />
			) : (
				<DialogPaidPlanIsRequired { ...dialogCommonProps } />
			) }
		</Dialog>
	);
}
