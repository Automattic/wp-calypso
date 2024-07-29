import { Button } from '@automattic/components';
import { css } from '@emotion/react';
import styled from '@emotion/styled';
import PluginIcon from 'calypso/my-sites/plugins/plugin-icon/plugin-icon';

const SpotlightContainer = styled.div`
	background: white;
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 30px;
	border: 1px solid var( --studio-gray-5 );
	border-radius: 5px;
`;

const SpotlightContent = styled.div`
	display: flex;
	align-items: center;
	flex-grow: 1;
`;

const SpotlightIllustration = styled.img`
	height: 75px;
`;

const SpotlightTextContainer = styled.div`
	margin-left: 20px;
	flex-grow: 1;
`;

const SpotlightTitle = styled.div`
	display: block;
	color: var( --color-neutral-50 );
	font-weight: 600;
	font-size: 0.75rem;
	margin-bottom: 5px;
`;

const SpotlightTagline = styled.div`
	display: block;
	color: var( --color-neutral-70 );
	font-weight: 600;
	font-size: 1rem;
`;

const SpotlightCta = styled.div`
	@media ( max-width: 560px ) {
		display: none;
	}

	max-height: 32px;
`;

const placeholderText = css`
	color: transparent;
	background-color: var( --color-neutral-0 );
	animation: loading-fade 1.6s ease-in-out infinite;
	border: none;
	width: 50%;

	@media ( max-width: 960px ) {
		width: 100%;
	}
`;

const placeholderImg = css`
	width: 75px;
	height: 75px;
	margin: 0;
`;

interface SpotlightProps {
	onClick: () => void;
	taglineText: string;
	illustrationSrc: string;
	titleText: string;
	ctaText: string;
	isPlaceholder?: boolean;
}

const Spotlight: React.FunctionComponent< SpotlightProps > = ( props: SpotlightProps ) => {
	const { taglineText, illustrationSrc, onClick, titleText, ctaText, isPlaceholder } = props;

	if ( isPlaceholder ) {
		return (
			<SpotlightContainer className="spotlight">
				<SpotlightContent>
					<PluginIcon isPlaceholder css={ placeholderImg } />
					<SpotlightTextContainer>
						<SpotlightTitle css={ placeholderText }>...</SpotlightTitle>
						<SpotlightTagline css={ placeholderText }>...</SpotlightTagline>
					</SpotlightTextContainer>
				</SpotlightContent>
			</SpotlightContainer>
		);
	}

	return (
		<SpotlightContainer onClick={ onClick } className="spotlight">
			<SpotlightContent>
				<SpotlightIllustration alt="Spotlight Logo" src={ illustrationSrc } />
				<SpotlightTextContainer>
					<SpotlightTitle>{ titleText }</SpotlightTitle>
					<SpotlightTagline>{ taglineText }</SpotlightTagline>
				</SpotlightTextContainer>
			</SpotlightContent>
			<SpotlightCta>
				<Button>{ ctaText }</Button>
			</SpotlightCta>
		</SpotlightContainer>
	);
};

export default Spotlight;
