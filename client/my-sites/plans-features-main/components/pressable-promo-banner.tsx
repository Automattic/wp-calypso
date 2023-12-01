import { Button, Gridicon, PressableLogo } from '@automattic/components';
import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import { plansBreakSmall } from 'calypso/my-sites/plans-grid/media-queries';

const Banner = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: start;
	min-height: 128px;
	padding: 0px, 24px, 0px, 0px;
	border-radius: 4px;
	border: 1px solid #dcdcde;
	margin: 24px 20px 24px 20px;
	padding: 24px 20px 24px 20px;
	align-items: center;
	gap: 16px;

	${ plansBreakSmall( css`
		flex-direction: row;
		padding: 0 20px 0 20px;
	` ) }
`;

const LogoContainer = styled.div`
	display: none;

	${ plansBreakSmall( css`
		display: inherit;
		flex-basis: 120px;
		flex-shrink: 0;
		background-color: var( --studio-white );
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
	font-size: 12px;
	font-weight: 400;
	text-align: left;
`;

const Title = styled.h2`
	font-size: 20px;
	font-weight: 500;
	text-align: left;
`;

const Description = styled.p`
	font-size: 14px;
	font-weight: 400;
	text-align: left;
	margin: 0;
`;

const CtaButton = styled( Button )`
	font-size: 14px;
	font-weight: 500;
	line-height: 20px;
	text-align: center;
	width: 100%;
	height: 40px;
	padding: 10px, 24px, 10px, 24px;
	border-radius: 4px;
	background-color: var( --studio-black );
	color: var( --studio-white );
	box-shadow: 0px 1px 2px 0px #0000000d;

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
				<PressableLogo />
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
					<Gridicon icon="external" />
				</CtaButton>
			</CtaContainer>
		</Banner>
	);
};

export default PressablePromoBanner;
