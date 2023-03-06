import { Card, LoadingPlaceholder } from '@automattic/components';
import styled from '@emotion/styled';
import { GitHubCardHeading } from '../github-card-heading';

import '../style.scss';

const FirstPlaceholder = styled( LoadingPlaceholder )( {
	height: 24,
	width: '85%',
	marginBottom: '1.25em',
} );
const SecondPlaceholder = styled( LoadingPlaceholder )( {
	height: 16,
	width: '50px',
	marginBottom: '.25em',
} );
const PlaceholderContainer = styled.div( {
	display: 'flex',
	gap: '10px',
	marginBottom: '1.5em',
} );
const ThirdPlaceholder = styled( LoadingPlaceholder )( {
	height: 24,
	width: '120px',
} );
const FourthPlaceholder = styled( LoadingPlaceholder )( {
	height: 24,
	width: '100px',
} );
const ButtonPlaceholder = styled( LoadingPlaceholder )( {
	width: '148px',
	height: '40px',
} );

export const GitHubPlaceholderCard = () => {
	return (
		<Card className="github-hosting-card">
			<GitHubCardHeading />
			<FirstPlaceholder />
			<SecondPlaceholder />
			<PlaceholderContainer>
				<ThirdPlaceholder />
				<FourthPlaceholder />
			</PlaceholderContainer>
			<ButtonPlaceholder />
		</Card>
	);
};
