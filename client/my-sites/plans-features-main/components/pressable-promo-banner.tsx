import { Button, Gridicon, PressableLogo } from '@automattic/components';
import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';
import { plansBreakSmall } from 'calypso/my-sites/plans-grid/media-queries';

const Banner = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: start;
	min-height: 128px;
	max-height: 170px;
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
		background-color: #ffffff;
	` ) }
`;

const TextContainer = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: center;
	height: 100%;

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
	background-color: #000000;
	color: #ffffff;
	box-shadow: 0px 1px 2px 0px #0000000d;

	${ plansBreakSmall( css`
		width: 199px;
	` ) }
`;

const PressablePromoBanner = () => {
	const translate = useTranslate();
	const onClick = () => {};

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
					href="https://pressable.com/multiple-site-solution/?utm_source=wpdotcom&utm_medium=referral&utm_campaign=pricing"
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
