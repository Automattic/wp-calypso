import { Button, Gridicon } from '@automattic/components';
import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';

const Banner = styled.div`
	display: flex;
	justify-content: left;
	height: 128px
	padding: 0px, 24px, 0px, 0px
	border-radius: 4px
	border: 1px solid #DCDCDE
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
			<div>Pressable Logo here</div>
			<div>
				<h4>{ translate( 'Hosting partner' ) }</h4>
				<h2>{ translate( 'Multi-Site Hosting by Pressable' ) }</h2>
				<p>
					{ translate(
						'Looking to manage multiple websites with ease? Discover the power of Pressable Multi-Site Hosting. Ideal for agencies and web professionals. '
					) }
				</p>
			</div>
			<div>
				<CtaButton
					href="https://pressable.com/pricing/?utm_source=referral&utm_medium=wpdotcom&utm_campaign=pricing"
					onClick={ onClick }
					target="_blank"
				>
					{ translate( 'See Pressable Plans' ) }
					<Gridicon icon="external" />
				</CtaButton>
			</div>
		</Banner>
	);
};

export default PressablePromoBanner;
