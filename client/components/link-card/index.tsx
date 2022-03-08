import styled from '@emotion/styled';
import { ReactChild } from 'react';

import './style.scss';

interface LinkCardContainerProps {
	background: string;
}

interface LinkCardProps {
	label: ReactChild;
	title: ReactChild;
	cta: ReactChild;
	background: string;
	url: string;
}

const LinkCardContainer = styled.div< LinkCardContainerProps >`
	border-radius: 5px;
	padding: 24px;
	background: var( --${ ( props ) => props.background } );
`;

const LinkCardLabel = styled.div`
	margin-bottom: 8px;
	font-size: var( --scss-font-body-extra-small );
	color: var( --color-text-inverted );
	line-height: 1.25rem;
	text-transform: capitalize;
`;

const LinkCardTitle = styled.div`
	@media ( max-width: 1090px ) {
		-webkit-line-clamp: 4; // trunk text to 4 lines then ellipsis
		line-clamp: 4;
	}

	margin-bottom: 32px;
	font-size: var( --scss-font-title-small );
	color: var( --color-text-inverted );
	text-overflow: ellipsis;
	word-wrap: break-word;
	overflow: hidden;
	display: -webkit-box;
	-webkit-line-clamp: 3; // trunk text to 3 lines then ellipsis
	line-clamp: 3;
	-webkit-box-orient: vertical;
	line-height: 1.5rem;
`;

const LinkCardCta = styled.div`
	font-size: var( --scss-font-body-small );
	color: var( --color-text-inverted );
	line-height: 1.25rem;
`;

const LinkCard = ( props: LinkCardProps ) => {
	const { label, title, cta, background, url } = props;

	return (
		<a href={ url }>
			<LinkCardContainer background={ background }>
				<LinkCardLabel>{ label }</LinkCardLabel>
				<LinkCardTitle>{ title }</LinkCardTitle>
				<LinkCardCta>{ cta }</LinkCardCta>
			</LinkCardContainer>
		</a>
	);
};

export default LinkCard;
