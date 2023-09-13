/* eslint-disable jsx-a11y/media-has-caption */
import { Button, ButtonProps } from '@automattic/components';
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
const MasterBar = styled.div`
	display: flex;
	padding: 24px;
	align-items: center;
	text-align: left;
	justify-content: left;
	left: 0;
	top: 0;
	width: 100%;
`;

const Header = styled.h1`
	font-size: 2rem;
	text-align: center;
	margin: 16px 0;
`;

const Content = styled.div`
	margin: 0 auto;
	padding: 24px;
	color: var( --studio-gray-5 );
	max-width: 717px;
	text-align: center;
`;

const Highlight = styled.p`
	margin-bottom: 32px;
	text-align: center;
	font-size: 16px;
`;

const ButtonBar = styled.div`
	margin-bottom: 32px;
	display: flex;
	justify-content: center;
	gap: 16px;
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

	return (
		<div>
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
				<Content>
					<Header className="wp-brand-font">{ translate( 'Thank you for trusting us' ) }</Header>
					<Highlight>
						{ translate(
							'Your 100-year legacy begins now. Experience the dedicated premium support team and exclusive benefits tailored just for you. We are thrilled to stand by your side for the next century.'
						) }
					</Highlight>
					<ButtonBar>
						<StyledButton dark>{ translate( 'View plan benefits' ) }</StyledButton>
						<StyledButton>{ translate( 'Access premium support' ) }</StyledButton>
					</ButtonBar>
					<video
						src="https://wpcom.files.wordpress.com/2023/08/century-100-banner.mp4"
						preload="metadata"
						width="715"
						height="250"
						muted
						playsInline
						autoPlay
					/>
				</Content>
			) }
		</div>
	);
}
