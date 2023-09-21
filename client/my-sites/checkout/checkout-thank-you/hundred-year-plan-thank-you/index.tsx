import { PLAN_100_YEARS, getPlan } from '@automattic/calypso-products';
import { Button } from '@automattic/components';
import { useMobileBreakpoint } from '@automattic/viewport-react';
import { Global, css } from '@emotion/react';
import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';
import page from 'page';
import { useEffect } from 'react';
import QuerySiteDomains from 'calypso/components/data/query-site-domains';
import WordPressLogo from 'calypso/components/wordpress-logo';
import { getRegisteredDomains } from 'calypso/lib/domains';
import { useSelector, useDispatch } from 'calypso/state';
import { fetchReceipt } from 'calypso/state/receipts/actions';
import { getReceiptById } from 'calypso/state/receipts/selectors';
import { getDomainsBySiteId, isRequestingSiteDomains } from 'calypso/state/sites/domains/selectors';
import { getSiteId, getSiteOptions } from 'calypso/state/sites/selectors';
import { hideMasterbar } from 'calypso/state/ui/actions';
import './styles.scss';

const HOUR_IN_MS = 1000 * 60;
const VideoContainer = styled.div< { isMobile: boolean } >`
	overflow: hidden;
	position: relative;
	width: 100%;
	height: 55vh;
	video {
		transform: translatez( 0 );
		position: ${ ( { isMobile } ) => ( isMobile ? 'absolute' : 'initial' ) };
		top: -125%;
		bottom: -100%;
		left: -100%;
		right: -100%;
		margin: auto;
		min-width: ${ ( { isMobile } ) => ( isMobile ? '305%' : '100%' ) };
		min-height: ${ ( { isMobile } ) => ( isMobile ? '100%' : 'unset' ) };
	}
`;
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
	text-align: ${ ( { isMobile } ) => ( isMobile ? 'left' : 'center' ) };
	margin: 16px 0;
`;

const Content = styled.div< { isMobile: boolean } >`
	margin: 0 auto;
	padding: 24px ${ ( { isMobile } ) => ( isMobile ? '16px' : '24px' ) };
	color: var( --studio-gray-5 );
	max-width: ${ ( { isMobile } ) => ( isMobile ? 'unset' : 'min( 95vw, 877px )' ) };
	text-align: center;
	.hundred-year-plan-thank-you__thank-you-text-container {
		margin: 24px ${ ( { isMobile } ) => ( isMobile ? '0' : '80px' ) };
	}
`;

const Highlight = styled.div< { isMobile: boolean } >`
	margin-bottom: 32px;
	text-align: ${ ( { isMobile } ) => ( isMobile ? 'left' : 'center' ) };
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
	padding: 10px 24px;
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

function PageLoadingView() {
	const translate = useTranslate();
	return (
		<div className="hundred-year-plan-flow-processing-screen__container">
			<h1 className="wp-brand-font">{ translate( 'Finalizing Purchase…' ) }</h1>
		</div>
	);
}

export default function HundredYearPlanThankYou( { siteSlug, receiptId }: Props ) {
	const dispatch = useDispatch();
	const translate = useTranslate();

	const siteId = useSelector( ( state ) => getSiteId( state, siteSlug ) );
	const siteCreatedTimeStamp = useSelector(
		( state ) => getSiteOptions( state, siteId ?? 0 )?.created_at
	);

	const receipt = useSelector( ( state ) => getReceiptById( state, receiptId ) );
	const isReceiptLoading = ! receipt.hasLoadedFromServer || receipt.isRequesting;

	const siteDomains = useSelector( ( state ) =>
		siteId ? getDomainsBySiteId( state, siteId ) : []
	);
	const isLoadingDomains = useSelector( ( state ) =>
		siteId ? isRequestingSiteDomains( state, siteId ) : false
	);
	const registeredDomains = getRegisteredDomains( siteDomains );
	const registeredDomain = registeredDomains.length ? registeredDomains[ 0 ] : null;

	useEffect( () => {
		dispatch( hideMasterbar() );
		if ( isReceiptLoading && receiptId ) {
			dispatch( fetchReceipt( receiptId ) );
		}
	}, [ dispatch, isReceiptLoading, receiptId ] );

	if (
		! isReceiptLoading &&
		( ! receipt.data?.purchases?.length || receipt.data?.purchases[ 0 ].blogId !== siteId )
	) {
		page( '/' );
	}

	const isMobile = useMobileBreakpoint();
	const isPageLoading = isReceiptLoading || isLoadingDomains;
	return (
		<>
			{ siteId && <QuerySiteDomains siteId={ siteId } /> }
			<Global
				styles={ css`
					body.is-section-checkout,
					body.is-section-checkout .layout__content {
						background: linear-gradient( 233deg, #06101c 2.17%, #050c16 41.26%, #02080f 88.44% );
					}
				` }
			/>

			{ isPageLoading && <PageLoadingView /> }
			{ ! isPageLoading && (
				<>
					<MasterBar>
						<CustomizedWordPressLogo size={ 24 } />
					</MasterBar>
					<Content isMobile={ isMobile }>
						<div className="hundred-year-plan-thank-you__thank-you-text-container">
							<Header className="wp-brand-font" isMobile={ isMobile }>
								{ translate( 'Your century-long legacy begins now' ) }
							</Header>
							<Highlight isMobile={ isMobile }>
								{ translate(
									'The %(planTitle)s for (%(domain)s) is active. Our Premier Support team will be in touch by email shortly to schedule a welcome session and walk you through your exclusive benefits. We’re looking forward to supporting you every step of the way.',
									{
										args: {
											domain: registeredDomain?.domain || siteSlug,
											planTitle: getPlan( PLAN_100_YEARS )?.getTitle() || '',
										},
									}
								) }
							</Highlight>
							{ siteCreatedTimeStamp && (
								<ButtonBar isMobile={ isMobile }>
									{ isSiteCreatedWithinLastHour( siteCreatedTimeStamp ) ? (
										<StyledLightButton
											onClick={ () => page( `/setup/site-setup/goals?siteSlug=${ siteSlug }` ) }
										>
											{ translate( 'Start building' ) }
										</StyledLightButton>
									) : (
										<StyledLightButton onClick={ () => page( ` /home/${ siteSlug }` ) }>
											{ translate( 'Manage your site' ) }
										</StyledLightButton>
									) }
								</ButtonBar>
							) }
						</div>
						<VideoContainer isMobile={ isMobile }>
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
						</VideoContainer>
					</Content>
				</>
			) }
		</>
	);
}
