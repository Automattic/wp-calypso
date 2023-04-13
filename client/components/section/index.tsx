import styled from '@emotion/styled';
import { ReactChild } from 'react';

import './style.scss';

interface SectionProps {
	header: ReactChild;
	subheader?: ReactChild;
	children: ReactChild | ReactChild[];
	dark?: boolean;
}

interface SectionContainerProps {
	dark?: boolean;
}

interface SectionHeaderProps {
	dark?: boolean;
}

export const SectionContainer = styled.div< SectionContainerProps >`
	::before {
		box-sizing: border-box;
		content: '';
		background-color: ${ ( props ) =>
			props.dark ? 'var( --studio-gray-100 )' : 'var( --studio-white )' };
		position: absolute;
		height: 100%;
		width: 200vw;
		left: -100vw;
		z-index: -1;
		margin-top: -56px;
	}
	padding: 56px 0;
`;

export const SectionHeader = styled.div< SectionHeaderProps >`
	color: var( --${ ( props ) => ( props.dark ? 'color-text-inverted' : 'color-text' ) } );
	font-weight: 400;
	letter-spacing: -0.4px;
	line-height: 1.2;
	text-align: left;
	font-size: var( --scss-font-title-large );
`;

const SectionSubHeader = styled.div< SectionHeaderProps >`
	color: var( --${ ( props ) => ( props.dark ? 'color-text-inverted' : 'color-text' ) } );
	font-weight: 400;
	text-align: left;
	font-size: var( --scss-font-body-small );
`;

export const SectionHeaderContainer = styled.div< SectionHeaderProps >`
	@media ( max-width: 660px ) {
		padding: 0 16px;
	}
	margin-bottom: 16px;
	max-width: 377px;
`;

const SectionContent = styled.div``;

const Section = ( props: SectionProps ) => {
	const { children, header, subheader, dark } = props;
	/* eslint-disable wpcalypso/jsx-classname-namespace */
	return (
		<SectionContainer dark={ dark }>
			<SectionHeaderContainer>
				<SectionHeader dark={ dark } className="wp-brand-font">
					{ header }
				</SectionHeader>
				{ subheader && <SectionSubHeader>{ subheader }</SectionSubHeader> }
			</SectionHeaderContainer>
			<SectionContent>{ children }</SectionContent>
		</SectionContainer>
	);
	/* eslint-enable wpcalypso/jsx-classname-namespace */
};

export default Section;
