import { Button } from '@automattic/components';
import styled from '@emotion/styled';

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
`;

const SpotlightIllustration = styled.img`
	height: 75px;
`;

const SpotlightTextContainer = styled.div`
	margin-left: 20px;
`;

const SpotlightTitle = styled.div`
	display: block;
	color: var( --color-neutral-50 );
	font-weight: 600;
	font-size: 0.75rem;
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
interface SpotlightProps {
	onClick: () => void;
	taglineText: string;
	illustrationSrc: string;
	titleText: string;
	ctaText: string;
}

const Spotlight: React.FunctionComponent< SpotlightProps > = ( props: SpotlightProps ) => {
	const { taglineText, illustrationSrc, onClick, titleText, ctaText } = props;

	return (
		<SpotlightContainer onClick={ onClick } className={ 'spotlight' }>
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
