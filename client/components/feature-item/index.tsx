import styled from '@emotion/styled';
import type { ReactNode } from 'react';

import './style.scss';

interface FeatureItemProps {
	header: ReactNode;
	children: ReactNode;
	dark?: boolean;
}

const FeatureItemContainer = styled.div`
	margin-top: calc( 64px - 25px ); // adds the margin needed for 64px
	width: calc( 33% - 10px );

	@media ( max-width: 660px ) {
		width: 100%;
		margin-top: 10px;
	}
`;

interface FeatureItemHeaderProps {
	dark?: boolean;
}

interface FeatureItemContentProps {
	dark?: boolean;
}

const FeatureItemHeader = styled.div< FeatureItemHeaderProps >`
	margin-bottom: 16px;
	font-size: var( --scss-font-body );
	font-weight: 500;
	line-height: 24px;
	color: var( --${ ( props ) => ( props.dark ? 'color-text-inverted' : 'color-text' ) } );
`;

const FeatureItemContent = styled.p< FeatureItemContentProps >`
	font-size: var( --scss-font-body-small );
	font-weight: 400;
	line-height: 22px;
	color: var( --${ ( props ) => ( props.dark ? 'color-neutral-20' : 'color-text' ) } );
`;

const FeatureItem = ( props: FeatureItemProps ) => {
	const { header, children, dark } = props;

	return (
		<FeatureItemContainer>
			<FeatureItemHeader dark={ dark }>{ header }</FeatureItemHeader>
			<FeatureItemContent dark={ dark }>{ children }</FeatureItemContent>
		</FeatureItemContainer>
	);
};

export default FeatureItem;
