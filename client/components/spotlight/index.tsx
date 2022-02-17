import { Button } from '@automattic/components';
import styled from '@emotion/styled';

const SpotlightContainer = styled.div`
	background-color: var( --studio-gray-0 );
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 20px;
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
	max-height: 32px;
`;
interface SpotlightProps {
	onClick?: () => void;
	url: string;
	taglineText: string;
	illustrationSrc: string;
}

const Spotlight: React.FunctionComponent< SpotlightProps > = ( props: SpotlightProps ) => {
	const { taglineText, illustrationSrc, onClick, url } = props;

	return (
		<a href={ url } onClick={ onClick }>
			<SpotlightContainer>
				<SpotlightContent>
					<SpotlightIllustration alt="Spotlight Logo" src={ illustrationSrc } />
					<SpotlightTextContainer>
						<SpotlightTitle>Under the Spotlight</SpotlightTitle>
						<SpotlightTagline>{ taglineText }</SpotlightTagline>
					</SpotlightTextContainer>
				</SpotlightContent>
				<SpotlightCta>
					<Button onClick={ onClick }>View Details</Button>
				</SpotlightCta>
			</SpotlightContainer>
		</a>
	);
};

export default Spotlight;
