import { Title, SubTitle } from '@automattic/onboarding';
import styled from '@emotion/styled';
import { PropsWithChildren } from 'react';
import { LoadingEllipsis } from 'calypso/components/loading-ellipsis';

const ScanningContainer = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	height: calc( 100vh - 200px );
	justify-content: center;
`;
const ScanningContent = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
`;

interface Props extends PropsWithChildren {
	className?: string;
	label: string;
	text: string;
}

export const Scanning = ( { label, text }: Props ) => {
	return (
		<ScanningContainer>
			<ScanningContent>
				<Title>{ label }</Title>
				<SubTitle>{ text }</SubTitle>
				<LoadingEllipsis />
			</ScanningContent>
		</ScanningContainer>
	);
};
