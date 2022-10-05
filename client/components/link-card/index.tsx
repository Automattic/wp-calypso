import styled from '@emotion/styled';
import { ReactChild } from 'react';
import ExternalLink from 'calypso/components/external-link';

import './style.scss';

interface LinkCardContainerProps {
	background?: string;
}

interface LinkCardElementsProps {
	dark?: boolean;
}

interface LinkCardProps {
	label?: ReactChild;
	title: ReactChild;
	cta?: ReactChild;
	background?: string;
	url: string;
	external?: boolean;
	dark?: boolean;
	onClick?: () => void;
}

const LinkCardContainer = styled.div< LinkCardContainerProps >`
	:hover {
		filter: brightness( 120% );
	}

	border-radius: 5px;
	padding: 24px;
	background: var( --${ ( props ) => props.background || 'studio-white' } );
`;

const LinkCardLabel = styled.div< LinkCardElementsProps >`
	margin-bottom: 8px;
	font-size: var( --scss-font-body-extra-small );
	color: rgba(
		var( --${ ( props ) => ( props.dark ? 'studio-celadon-60-rgb' : 'studio-purple-5-rgb' ) } ),
		0.75
	);
	line-height: 1.25rem;
`;

const LinkCardTitle = styled.div< LinkCardElementsProps >`
	@media ( max-width: 1090px ) {
		-webkit-line-clamp: 4; // trunk text to 4 lines then ellipsis
		line-clamp: 4;
	}

	color: var( --${ ( props ) => ( props.dark ? 'studio-celadon-60' : 'studio-purple-5' ) } );
	margin-bottom: 32px;
	font-size: var( --scss-font-title-small );
	text-overflow: ellipsis;
	word-wrap: break-word;
	overflow: hidden;
	display: -webkit-box;
	-webkit-line-clamp: 3; // trunk text to 3 lines then ellipsis
	line-clamp: 3;
	-webkit-box-orient: vertical;
	line-height: 1.5rem;
`;

const LinkCardCta = styled.div< LinkCardElementsProps >`
	font-size: var( --scss-font-body-small );
	color: rgba(
		var( --${ ( props ) => ( props.dark ? 'studio-celadon-60-rgb' : 'studio-purple-5-rgb' ) } ),
		0.75
	);
	line-height: 1.25rem;
`;

const LinkCard = ( props: LinkCardProps ) => {
	const { label, title, cta, background, url, external, dark, onClick } = props;

	const Link = external ? ExternalLink : 'a';

	return (
		<Link href={ url } onClick={ onClick }>
			<LinkCardContainer background={ background }>
				<LinkCardLabel dark={ dark }>{ label }</LinkCardLabel>
				<LinkCardTitle dark={ dark }>{ title }</LinkCardTitle>
				<LinkCardCta dark={ dark }>{ cta }</LinkCardCta>
			</LinkCardContainer>
		</Link>
	);
};

export default LinkCard;
