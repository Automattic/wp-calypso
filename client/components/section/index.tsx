import styled from '@emotion/styled';
import { ReactChild } from 'react';

import './style.scss';

interface SectionProps {
	header: ReactChild;
	children: ReactChild | ReactChild[];
	dark?: boolean;
}

interface SectionContainerProps {
	dark?: boolean;
}

interface SectionHeaderProps {
	dark?: boolean;
}

const SectionContainer = styled.div< SectionContainerProps >`
	::before {
		box-sizing: border-box;
		content: '';
		background-color: ${ ( props ) =>
			props.dark ? 'var( --studio-gray-100 )' : 'var( --studio-gray-0 )' };
		position: absolute;
		height: 100%;
		width: 200vw;
		left: -100vw;
		z-index: -1;
		margin-top: -96px;
	}
	padding: 96px 0;
`;

const SectionHeader = styled.div< SectionHeaderProps >`
	@media ( max-width: 660px ) {
		padding: 0 16px;
	}

	color: var( --${ ( props ) => ( props.dark ? 'color-text-inverted' : 'color-text' ) } );
	font-weight: 400;
	letter-spacing: -0.4px;
	text-align: left;
	margin-bottom: 25px;
	font-size: var( --scss-font-title-large );
	max-width: 377px;
	line-height: 40px;
`;

const SectionContent = styled.div``;

const Section = ( props: SectionProps ) => {
	const { children, header, dark } = props;
	/* eslint-disable wpcalypso/jsx-classname-namespace */
	return (
		<SectionContainer dark={ dark }>
			<SectionHeader dark={ dark } className="wp-brand-font">
				{ header }
			</SectionHeader>
			<SectionContent>{ children }</SectionContent>
		</SectionContainer>
	);
	/* eslint-enable wpcalypso/jsx-classname-namespace */
};

export default Section;
