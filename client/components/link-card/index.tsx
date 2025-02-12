import { ExternalLink } from '@automattic/components';
import styled from '@emotion/styled';
import { ReactNode } from 'react';

import './style.scss';

interface LinkCardContainerProps {
	background?: string;
	border?: string;
}
interface LinkCardProps {
	label?: ReactNode;
	title: ReactNode;
	titleMarginBottom?: string;
	cta?: ReactNode;
	background?: string;
	border?: string;
	url: string;
	target?: string;
	external?: boolean;
	onClick?: ( ( event: React.MouseEvent< HTMLAnchorElement > ) => void ) | ( () => void );
}

const LinkCardContainer = styled.div< LinkCardContainerProps >`
	:hover {
		filter: brightness( 102% );
	}

	border-radius: 5px;
	padding: 24px;
	background: ${ ( props ) => props.background || 'var(--studio-white)' };
	border: ${ ( props ) => ( props.border ? `1px solid ${ props.border }` : 'none' ) };
`;

const LinkCardLabel = styled.div`
	margin-bottom: 8px;
	font-size: var( --scss-font-body-extra-small );
	color: rgba( var( --studio-blue-50 ), 0.75 );
	line-height: 1.25rem;
`;

const LinkCardTitle = styled.div< { marginBottom?: string } >`
	@media ( max-width: 1090px ) {
		-webkit-line-clamp: 4; // trunk text to 4 lines then ellipsis
		line-clamp: 4;
	}

	color: var( --studio-blue-50 );
	margin-bottom: ${ ( props ) => props.marginBottom || '32px' };
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

const LinkCardCta = styled.div`
	font-size: var( --scss-font-body-small );
	color: rgba( var( --studio-blue-50 ), 0.75 );
	line-height: 1.25rem;
`;

const LinkCard = ( props: LinkCardProps ) => {
	const {
		label,
		title,
		titleMarginBottom,
		cta,
		background,
		border,
		url,
		external,
		target,
		onClick,
	} = props;

	const Link = external ? ExternalLink : 'a';

	return (
		<Link target={ target } href={ url } onClick={ onClick } className="card-block">
			<LinkCardContainer background={ background } border={ border }>
				{ label && <LinkCardLabel>{ label }</LinkCardLabel> }
				{ title && <LinkCardTitle marginBottom={ titleMarginBottom }>{ title }</LinkCardTitle> }
				{ cta && <LinkCardCta>{ cta }</LinkCardCta> }
			</LinkCardContainer>
		</Link>
	);
};

export default LinkCard;
