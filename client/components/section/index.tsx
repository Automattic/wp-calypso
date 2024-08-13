import styled from '@emotion/styled';
import { ReactElement, ReactNode } from 'react';

import './style.scss';

interface SectionProps {
	header: string | ReactElement;
	subheader?: string | ReactElement;
	children: ReactNode;
	dark?: boolean;
	isLoggedIn?: boolean;
	marginBottom?: string;
}

interface SectionWrapperProps {
	dark?: boolean;
	isLoggedIn?: boolean;
	marginBottom?: string;
}

interface SectionContainerProps {
	dark?: boolean;
}

interface SectionHeaderProps {
	dark?: boolean;
}

export const SectionWrapper = styled.div< SectionWrapperProps >`
	--content-width: ${ ( props ) =>
		props.isLoggedIn
			? `calc( 100vw - var( --sidebar-width-max, 0px ) - ( var( --content-frame-right-padding, 0px ))  )`
			: '100vw' };
	width: var( --content-width );
	position: relative;
	left: 50%;
	right: 50%;
	margin-left: calc( -1 * var( --content-width ) / 2 );
	margin-right: calc( -1 * var( --content-width ) / 2 );
	background-color: ${ ( props ) =>
		props.dark ? 'var( --studio-gray-100 )' : 'var( --studio-white )' };
	${ ( props ) => props.marginBottom && `margin-bottom: ${ props.marginBottom };` }
`;

export const SectionContainer = styled.div< SectionContainerProps >`
	padding: 56px var( --content-margin, 0 );
	max-width: 1040px;
	margin: 0 auto;
	box-sizing: border-box;
`;

export const SectionHeader = styled.div< SectionHeaderProps >`
	color: var( --${ ( props ) => ( props.dark ? 'color-text-inverted' : 'color-text' ) } );
	font-weight: 400;
	letter-spacing: -0.4px;
	line-height: 1.2;
	html[dir='ltr'] & {
		text-align: left;
	}
	html[dir='rtl'] & {
		text-align: right;
	}
	font-size: var( --scss-font-title-large );
`;

const SectionSubHeader = styled.div< SectionHeaderProps >`
	color: var( --${ ( props ) => ( props.dark ? 'color-text-inverted' : 'color-text' ) } );
	font-weight: 400;
	html[dir='ltr'] & {
		text-align: left;
	}
	html[dir='rtl'] & {
		text-align: right;
	}
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
	const { children, header, subheader, dark, isLoggedIn, marginBottom } = props;
	/* eslint-disable wpcalypso/jsx-classname-namespace */
	return (
		<SectionWrapper dark={ dark } isLoggedIn={ isLoggedIn } marginBottom={ marginBottom }>
			<SectionContainer dark={ dark }>
				<SectionHeaderContainer>
					<SectionHeader dark={ dark } className="wp-brand-font">
						{ header }
					</SectionHeader>
					{ subheader && <SectionSubHeader>{ subheader }</SectionSubHeader> }
				</SectionHeaderContainer>
				<SectionContent>{ children }</SectionContent>
			</SectionContainer>
		</SectionWrapper>
	);
	/* eslint-enable wpcalypso/jsx-classname-namespace */
};

export default Section;
