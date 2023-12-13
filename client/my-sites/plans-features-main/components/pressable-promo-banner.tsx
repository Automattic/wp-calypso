import { Button, PressableLogo } from '@automattic/components';
import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import { plansBreakSmall, plansBreakMedium } from 'calypso/my-sites/plans-grid/media-queries';

const Banner = styled.div`
	background-color: var( --studio-white );
	display: flex;
	flex-direction: column;
	justify-content: start;
	min-height: 80px;
	border-radius: 4px;
	border: 1px solid #dcdcde;
	margin: 60px 20px 60px 20px;
	padding: 24px;
	align-items: center;
	gap: 32px;

	${ plansBreakSmall( css`
		flex-direction: row;
	` ) }
`;

const LogoContainer = styled.div`
	display: none;

	${ plansBreakSmall( css`
		display: inherit;
		background-color: #f9f9f9;
		border-radius: 4px;
		height: 100px;
		flex-basis: 100px;
		flex-shrink: 0;
		align-items: center;
		justify-content: center;
	` ) }
`;

const TextContainer = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: center;

	${ plansBreakSmall( css`
		flex-basis: 1200px;
	` ) }
`;

const CtaContainer = styled.div`
	width: 100%;
	${ plansBreakSmall( css`
		flex-basis: 200px;
		width: auto;
	` ) }
`;

const Subtitle = styled.h4`
	font-name: SF Pro Text;
	font-size: 12px;
	font-weight: 400;
	text-align: left;
	line-height: 20px;
	color: var( --studio-gray-50 );
`;

const Title = styled.h2`
	font-name: SF Pro Display;
	font-size: 20px;
	font-weight: 500;
	text-align: left;
	line-height: 26px;
	color: var( --studio-black );
	margin-top: 6px;
	margin-bottom: 6px;
`;

const Description = styled.p`
	font-size: 1rem;
	line-height: 24px;
	color: var( --studio-gray-80 );
	font-weight: 400;
	margin: 0;

	${ plansBreakSmall( css`
		font-size: 0.875rem;
		line-height: 20px;
	` ) }

	${ plansBreakMedium( css`
		font-size: 0.813rem;
		line-height: 16px;
	` ) }
`;

const CtaButton = styled( Button )`
	font-weight: 500;
	line-height: 20px;
	border-radius: 4px;
	padding: 10px 12px;
	border: unset;
	text-align: center;
	width: 100%;
	height: 40px;
	padding: 10px, 24px, 10px, 24px;
	border-radius: 4px;
	background-color: var( --studio-gray-80 );
	color: var( --studio-gray-0 );

	&:focus {
		box-shadow:
			0 0 0 2px var( --studio-white ),
			0 0 0 4px var( --studio-gray-80 );
	}

	&:hover {
		opacity: 0.85;
		transition: 0.7s;
		color: var( --studio-white );
	}

	${ plansBreakSmall( css`
		width: 199px;
	` ) }
`;

const PressablePromoBanner = ( {
	onShow,
	onClick,
}: {
	onShow: () => void;
	onClick: () => void;
} ) => {
	const translate = useTranslate();

	useEffect( () => {
		onShow();
	}, [ onShow ] );

	return (
		<Banner>
			<LogoContainer>
				<PressableLogo height={ 40 } width={ 40 } />
			</LogoContainer>
			<TextContainer>
				<Subtitle>{ translate( 'Hosting partner' ) }</Subtitle>
				<Title>{ translate( 'Agency Hosting by Pressable' ) }</Title>
				<Description>
					{ translate(
						"Looking to manage multiple sites with ease? Discover Pressable's powerful and intuitive platform that goes beyond traditional WordPress hosting. Ideal for agencies and web professionals."
					) }
				</Description>
			</TextContainer>
			<CtaContainer>
				<CtaButton
					href="https://pressable.com/multiple-site-solution/?utm_source=wpdotcom&utm_medium=referral&utm_campaign=calypso_signup"
					onClick={ onClick }
					target="_blank"
				>
					{ translate( 'See Pressable Plans' ) }
				</CtaButton>
			</CtaContainer>
		</Banner>
	);
};

export default PressablePromoBanner;
