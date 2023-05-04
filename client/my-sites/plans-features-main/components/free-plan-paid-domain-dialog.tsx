import { PlanSlug, getPlan } from '@automattic/calypso-products';
import { Button, Dialog } from '@automattic/components';
import { formatCurrency } from '@automattic/format-currency';
import { Global, css } from '@emotion/react';
import styled from '@emotion/styled';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { getCurrentUserCurrencyCode } from 'calypso/state/currency-code/selectors';
import {
	getQueryKey,
	useGetWordPressSubdomain,
} from '../../plan-features-2023-grid/hooks/use-get-wordpress-subdomain';
import usePlanPrices from '../../plans/hooks/use-plan-prices';
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

export function FreePlanPaidDomainDialog( {
	domainName,
	suggestedPlanSlug,
	onFreePlanSelected,
	onPlanSelected,
	onClose,
}: {
	domainName: string;
	suggestedPlanSlug: PlanSlug;
	onClose: () => void;
	onFreePlanSelected: ( domainSuggestion: DomainSuggestion ) => void;
	onPlanSelected: () => void;
} ) {
	const translate = useTranslate();
	const queryClient = useQueryClient();
	const [ isBusy, setIsBusy ] = useState( false );
	const planPrices = usePlanPrices( { planSlug: suggestedPlanSlug, returnMonthly: true } );
	const currencyCode = useSelector( getCurrentUserCurrencyCode );
	const {
		data: wordPressSubdomainSuggestion,
		isInitialLoading,
		isError,
	} = useGetWordPressSubdomain( domainName );
	const planTitle = getPlan( suggestedPlanSlug )?.getTitle();

	function handlePaidPlanClick() {
		setIsBusy( true );
		onPlanSelected();
	}

	function handleFreeDomainClick() {
		setIsBusy( true );
		// Since this domain will not be available after it is selected, invalidate the cache.
		queryClient.invalidateQueries( getQueryKey( domainName ) );
		if ( wordPressSubdomainSuggestion ) {
			onFreePlanSelected( wordPressSubdomainSuggestion );
		}
	}

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
			<DialogContainer>
				<Heading>{ translate( 'A paid plan is required for your domain.' ) }</Heading>
				<SubHeading>
					{ translate(
						'Custom domains are only available with a paid plan. And they are free for the first year with an annual paid plan.'
					) }
				</SubHeading>
				<ButtonContainer>
					<RowWithBorder>
						<DomainName>
							<div>{ domainName }</div>
							<FreeDomainText>{ translate( 'Free for one year ' ) }</FreeDomainText>
						</DomainName>
						<StyledButton busy={ isBusy } primary onClick={ handlePaidPlanClick }>
							{ currencyCode &&
								translate( 'Get %(planTitle)s - %(planPrice)s/month', {
									comment: 'Eg: Get Personal - $4/month',
									args: {
										planTitle,
										planPrice: formatCurrency(
											planPrices.discountedRawPrice || planPrices.rawPrice,
											currencyCode,
											{ stripZeros: true }
										),
									},
								} ) }
						</StyledButton>
					</RowWithBorder>
					<Row>
						<DomainName>
							{ isInitialLoading && <LoadingPlaceHolder /> }
							{ ! isError && <div>{ wordPressSubdomainSuggestion?.domain_name }</div> }
						</DomainName>
						<StyledButton
							disabled={ isInitialLoading || ! wordPressSubdomainSuggestion }
							busy={ isBusy }
							onClick={ handleFreeDomainClick }
						>
							{ translate( 'Continue with Free plan' ) }
						</StyledButton>
					</Row>
				</ButtonContainer>
			</DialogContainer>
		</Dialog>
	);
}
