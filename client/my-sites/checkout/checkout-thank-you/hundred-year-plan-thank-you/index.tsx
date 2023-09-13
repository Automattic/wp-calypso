/* eslint-disable jsx-a11y/media-has-caption */
import { Button, ButtonProps } from '@automattic/components';
import { useMobileBreakpoint } from '@automattic/viewport-react';
import { Global, css } from '@emotion/react';
import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';
import page from 'page';
import React, { useEffect } from 'react';
import WordPressLogo from 'calypso/components/wordpress-logo';
import { useSelector, useDispatch } from 'calypso/state';
import { fetchReceipt } from 'calypso/state/receipts/actions';
import { getReceiptById } from 'calypso/state/receipts/selectors';
import { hideMasterbar } from 'calypso/state/ui/actions';

interface Props {
	site: number | string;
	receiptId: number;
}

const PageContainer = styled.div``;
const MasterBar = styled.div`
	height: 48px;
	width: 100%;
	padding: 24px 0 0 24px;
`;

const Header = styled.h1`
	font-size: 2rem;
	text-align: center;
	margin: 16px 0;
`;

const Content = styled.div< { isMobile: boolean } >`
	margin: 0 auto;
	padding: 24px;
	color: var( --studio-gray-5 );
	max-width: 877px;
	text-align: center;
	.hundred-year-plan-thank-you__thank-you-text-container {
		margin: 24px ${ ( { isMobile } ) => ( isMobile ? '24px' : '80px' ) };
	}
`;

const Highlight = styled.p`
	margin-bottom: 32px;
	text-align: center;
	font-size: 16px;
`;

const ButtonBar = styled.div< { isMobile: boolean } >`
	margin-bottom: ${ ( { isMobile } ) => ( isMobile ? '8px' : '32px' ) };
	display: flex;
	justify-content: center;
	gap: 16px;
	flex-direction: ${ ( { isMobile } ) => ( isMobile ? 'column' : 'row' ) };
`;

const StyledButton = styled< ButtonProps & { dark?: boolean } >( Button )`
	border-radius: 4px;
	border: ${ ( { dark } ) => ( dark ? '1px solid var( --gray-gray-0, #f6f7f7 )' : 'none' ) };
	box-shadow: 0px 1px 2px 0px rgba( 0, 0, 0, 0.05 );
	font-size: 14px;
	font-weight: 500;
	line-height: 20px;
	letter-spacing: 0.32px;
	text-align: center;
	background-color: ${ ( { dark } ) => ( dark ? 'var(--studio-black)' : 'none' ) };
	background: ${ ( { dark } ) =>
		! dark ? 'linear-gradient( #c1c0d3, #e3e2f3, #c1c0d3 )' : 'none' };
	color: ${ ( { dark } ) => ( dark ? 'var(--studio-gray-0)' : 'var(--studio-black)' ) };
`;

const CustomizedWordPressLogo = styled( WordPressLogo )`
	margin: 0;
	fill: var( --studio-white );
`;

export default function HundredYearPlanThankYou( { receiptId }: Props ) {
	const dispatch = useDispatch();
	const translate = useTranslate();
	const receipt = useSelector( ( state ) => getReceiptById( state, receiptId ) );
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
			<Global
				styles={ css`
					body.is-section-checkout,
					body.is-section-checkout .layout__content {
						background: linear-gradient( 233deg, #06101c 2.17%, #050c16 41.26%, #02080f 88.44% );
					}
				` }
			/>
			<MasterBar>
				<div>
					{ ' ' }
					<CustomizedWordPressLogo size={ 24 } />
				</div>
			</MasterBar>
			<PageContainer>
				{ ! isReceiptLoading && (
					<Content isMobile={ isMobile }>
						<div className="hundred-year-plan-thank-you__thank-you-text-container">
							<Header className="wp-brand-font">
								{ translate( 'Thank you for trusting us' ) }
							</Header>
							<Highlight>
								{ translate(
									'Your 100-year legacy begins now. Experience the dedicated premium support team and exclusive benefits tailored just for you. We are thrilled to stand by your side for the next century.'
								) }
							</Highlight>
							<ButtonBar isMobile={ isMobile }>
								<StyledButton dark>{ translate( 'View plan benefits' ) }</StyledButton>
								<StyledButton>{ translate( 'Access premium support' ) }</StyledButton>
							</ButtonBar>
						</div>
						<video
							src="https://wpcom.files.wordpress.com/2023/08/century-100-banner.mp4"
							preload="metadata"
							width="100%"
							height="auto"
							muted
							playsInline
							autoPlay
						/>
					</Content>
				) }
			</PageContainer>
		</>
	);
}
