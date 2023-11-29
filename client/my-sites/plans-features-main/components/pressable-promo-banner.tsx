import { Button, Gridicon, PressableLogo } from '@automattic/components';
import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';

const Banner = styled.div`
	display: flex;
	justify-content: start;
	min-height: 128px;
	padding: 0px, 24px, 0px, 0px;
	border-radius: 4px;
	border: 1px solid #dcdcde;
	margin: 24px 20px 24px 20px;
	padding-right: 20px;
	padding-left: 20px;
	align-items: center;
	gap: 16px;
`;

const LogoContainer = styled.div`
	flex-basis: 120px;
	background-color: #ffffff;
`;

const TextContainer = styled.div`
	display: flex;
	flex-basis: 1200px;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	height: 100%;
`;

const CtaContainer = styled.div`
	flex-basis: 200px;
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
`;

const CtaButton = styled( Button )`
	font-size: 14px;
	font-weight: 500;
	line-height: 20px;
	text-align: center;
	width: 199px;
	height: 40px;
	padding: 10px, 24px, 10px, 24px;
	border-radius: 4px;
	background-color: #000000;
	color: #ffffff;
	box-shadow: 0px 1px 2px 0px #0000000d;
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
				<Title>{ translate( 'Multi-Site Hosting by Pressable' ) }</Title>
				<Description>
					{ translate(
						'Looking to manage multiple websites with ease? Discover the power of Pressable Multi-Site Hosting. Ideal for agencies and web professionals. '
					) }
				</Description>
			</TextContainer>
			<CtaContainer>
				<CtaButton
					href="https://pressable.com/pricing/?utm_source=referral&utm_medium=wpdotcom&utm_campaign=pricing"
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
