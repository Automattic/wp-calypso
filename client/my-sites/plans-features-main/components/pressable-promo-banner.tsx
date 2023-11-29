import { Button, Gridicon } from '@automattic/components';
import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';

const Banner = styled.div`
	display: flex;
	justify-content: start;
	height: 128px;
	padding: 0px, 24px, 0px, 0px;
	border-radius: 4px;
	border: 1px solid #dcdcde;
	margin-left: 20px;
	margin-right: 20px;
	padding-right: 20px;
	align-items: center;
	gap: 16px;
`;

const LogoContainer = styled.div`
	flex-basis: 120px;
`;

const TextContainer = styled.div`
	flex-basis: 1200px;
`;

const CtaContainer = styled.div`
	flex-basis: 200px;
`;

const Subtitle = styled.h4`
	font-family: SF Pro Text;
	font-size: 12px;
	font-weight: 400;
	line-height: 20px;
	letter-spacing: 0em;
	text-align: left;
`;

const Title = styled.h2`
	font-family: SF Pro Display;
	font-size: 20px;
	font-weight: 500;
	line-height: 26px;
	letter-spacing: 0.3799999952316284px;
	text-align: left;
`;

const Description = styled.p`
	font-family: SF Pro Text;
	font-size: 14px;
	font-weight: 400;
	line-height: 20px;
	letter-spacing: -0.15000000596046448px;
	text-align: left;
`;

const CtaButton = styled( Button )`
	font-family: SF Pro Display;
	font-size: 14px;
	font-weight: 500;
	line-height: 20px;
	letter-spacing: 0.3199999928474426px;
	text-align: center;
	width: 199px;
	height: 40px;
	padding: 10px, 24px, 10px, 24px;
	border-radius: 4px;
	gap: 8px;
	background-color: #000000;
	color: #ffffff;
	box-shadow: 0px 1px 2px 0px #0000000d;
`;

const PressablePromoBanner = () => {
	const translate = useTranslate();
	const onClick = () => {};

	return (
		<Banner>
			<LogoContainer>Pressable Logo here</LogoContainer>
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
