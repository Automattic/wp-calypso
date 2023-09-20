import { Button } from '@automattic/components';
import { useMobileBreakpoint } from '@automattic/viewport-react';
import { Global, css } from '@emotion/react';
import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';
import page from 'page';
import React, { useEffect } from 'react';
import QuerySitePurchases from 'calypso/components/data/query-site-purchases';
import WordPressLogo from 'calypso/components/wordpress-logo';
import { useSelector, useDispatch } from 'calypso/state';
import { getSitePurchases } from 'calypso/state/purchases/selectors';
import { fetchReceipt } from 'calypso/state/receipts/actions';
import { getReceiptById } from 'calypso/state/receipts/selectors';
import { getSiteId, getSiteOptions } from 'calypso/state/sites/selectors';
import { hideMasterbar } from 'calypso/state/ui/actions';

const HOUR_IN_MS = 1000 * 60;

export const LoadingPlaceHolder = styled.div`
	margin: 0;
	background: #c1c0d3;
	border-radius: 2px;
	content: '';
	display: inline-block;
	width: 77px;
	height: 10px;
	-webkit-animation: pulse-light 0.8s ease-in-out infinite;
	animation: pulse-light 0.8s ease-in-out infinite;
	opacity: 0.5;
`;

function SiteSlugWithLoader( { siteSlug }: { siteSlug?: string } ) {
	return siteSlug ? siteSlug : <LoadingPlaceHolder />;
}

interface Props {
	siteSlug: string;
	receiptId: number;
}

const MasterBar = styled.div`
	height: 48px;
	width: 100%;
	padding: 24px 0 0 24px;
	box-sizing: border-box;
`;

const Header = styled.h1< { isMobile: boolean } >`
	font-size: ${ ( { isMobile } ) => ( isMobile ? '2rem' : '2.75rem' ) };
	line-height: ${ ( { isMobile } ) => ( isMobile ? '32px' : '52px' ) };
	text-align: center;
	margin: 16px 0;
`;

const Content = styled.div< { isMobile: boolean } >`
	margin: 0 auto;
	padding: 24px ${ ( { isMobile } ) => ( isMobile ? '9px' : '24px' ) };
	color: var( --studio-gray-5 );
	max-width: min( 95vw, 877px );
	text-align: center;
	.hundred-year-plan-thank-you__thank-you-text-container {
		margin: 24px ${ ( { isMobile } ) => ( isMobile ? '24px' : '80px' ) };
	}
`;

const Highlight = styled.div`
	margin-bottom: 32px;
	text-align: center;
	font-size: 16px;
	p {
		margin: 0;
	}
`;

const ButtonBar = styled.div< { isMobile: boolean } >`
	margin-bottom: ${ ( { isMobile } ) => ( isMobile ? '8px' : '32px' ) };
	display: flex;
	justify-content: center;
	gap: 16px;
	flex-direction: ${ ( { isMobile } ) => ( isMobile ? 'column' : 'row' ) };
`;

const StyledButton = styled( Button )`
	border-radius: 4px;
	font-size: 14px;
	font-weight: 500;
	line-height: 20px;
	letter-spacing: 0.32px;
	text-align: center;
	background: none;
	box-shadow: none;
	outline-offset: 3px;
	color: var( --studio-gray-0 );
	&:focus {
		outline: 2px solid var( --studio-gray-0 );
	}
	&:hover {
		opacity: 85%;
		color: var( --studio-gray-0 );
	}
`;

const StyledLightButton = styled( StyledButton )`
	border: 1px solid var( --gray-gray-0, #f6f7f7 );
	background-color: var( --studio-black );
	background: linear-gradient( #c1c0d3, #e3e2f3, #c1c0d3 );
	color: var( --studio-black );
	border: none;

	&:hover {
		opacity: 85%;
		color: var( --studio-black );
	}

	&:focus {
		outline: 2px solid #d6d5e7;
	}
`;

const CustomizedWordPressLogo = styled( WordPressLogo )`
	margin: 0;
	fill: var( --studio-white );
`;

function isSiteCreatedWithinLastHour( createdTime: string ): boolean {
	return Date.now() - new Date( createdTime ).getTime() < HOUR_IN_MS;
}

export default function HundredYearPlanThankYou( { siteSlug, receiptId }: Props ) {
	const dispatch = useDispatch();
	const translate = useTranslate();

	const receipt = useSelector( ( state ) => getReceiptById( state, receiptId ) );
	const siteId = useSelector( ( state ) => getSiteId( state, siteSlug ) );
	const siteCreatedTimeStamp = useSelector(
		( state ) => getSiteOptions( state, siteId ?? 0 )?.created_at
	);
	const sitePurchases = useSelector( ( state ) => getSitePurchases( state, siteId ?? 0 ) );
	const domainPurchase = sitePurchases?.find( ( purchase ) => purchase.isDomain );
	const isReceiptLoading = ! receipt.hasLoadedFromServer || receipt.isRequesting;
	useEffect( () => {
		dispatch( hideMasterbar() );
		if ( isReceiptLoading && receiptId ) {
			dispatch( fetchReceipt( receiptId ) );
		}
	}, [ dispatch, isReceiptLoading, receiptId ] );

	if ( ! isReceiptLoading && ! receipt.data?.purchases?.length ) {
		page( '/' );
	}
	const isMobile = useMobileBreakpoint();

	return (
		<>
			<QuerySitePurchases siteId={ siteId } />
			<Global
				styles={ css`
					body.is-section-checkout,
					body.is-section-checkout .layout__content {
						background: linear-gradient( 233deg, #06101c 2.17%, #050c16 41.26%, #02080f 88.44% );
					}
				` }
			/>
			<MasterBar>
				<CustomizedWordPressLogo size={ 24 } />
			</MasterBar>
			{ ! isReceiptLoading && (
				<Content isMobile={ isMobile }>
					<div className="hundred-year-plan-thank-you__thank-you-text-container">
						<Header className="wp-brand-font" isMobile={ isMobile }>
							{ translate( 'Your legacy is in safe hands' ) }
						</Header>
						<Highlight>
							<p>
								{ translate(
									"Congratulations on securing the 100-Year Plan. We've applied your exclusive, tailor-made benefits to {{siteSlugWithLoader}}{{/siteSlugWithLoader}}.",
									{
										components: {
											siteSlugWithLoader: <SiteSlugWithLoader siteSlug={ domainPurchase?.meta } />,
										},
									}
								) }
							</p>
							<p>
								{ translate(
									'If you have any questions or need assistance with anything at all, our dedicated Premier Support team are standing by to help.'
								) }
							</p>
						</Highlight>
						{ siteCreatedTimeStamp && (
							<ButtonBar isMobile={ isMobile }>
								{ isSiteCreatedWithinLastHour( siteCreatedTimeStamp ) ? (
									<StyledButton onClick={ () => page( `/plans/my-plan/${ siteSlug }` ) }>
										{ translate( 'View plan benefits' ) }
									</StyledButton>
								) : (
									<StyledButton
										onClick={ () => page( `/setup/site-setup/goals?siteSlug=${ siteSlug }` ) }
									>
										{ translate( 'Start building' ) }
									</StyledButton>
								) }
								<StyledLightButton onClick={ () => page( '/help' ) }>
									{ translate( 'Access premium support' ) }
								</StyledLightButton>
							</ButtonBar>
						) }
					</div>
					<video
						src="https://wpcom.files.wordpress.com/2023/08/century-100-banner.mp4"
						preload="auto"
						width="100%"
						height="auto"
						muted
						playsInline
						autoPlay
						loop
					/>
				</Content>
			) }
		</>
	);
}
