import styled from '@emotion/styled';
import { ReactChild } from 'react';

import './style.scss';

interface FeatureItemProps {
	header: ReactChild;
	children: ReactChild;
}

const FeatureItemContainer = styled.div`
	margin-top: calc( 64px - 25px ); // adds the margin needed for 64px
`;

const FeatureItemHeader = styled.div`
	margin-bottom: 16px;
	font-size: var( --scss-font-body );
	font-weight: 500;
	line-height: 24px;
	color: var( --color-text-inverted );
`;

const FeatureItemContent = styled.p`
	font-size: var( --scss-font-body-small );
	font-weight: 400;
	line-height: 22px;
	color: var( --color-neutral-20 );
`;

const FeatureItem = ( props: FeatureItemProps ) => {
	const { header, children } = props;

	return (
		<FeatureItemContainer>
			<FeatureItemHeader>{ header }</FeatureItemHeader>
			<FeatureItemContent>{ children }</FeatureItemContent>
		</FeatureItemContainer>
	);
};

export default FeatureItem;
