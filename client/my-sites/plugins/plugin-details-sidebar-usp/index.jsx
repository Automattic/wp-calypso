import styled from '@emotion/styled';
import ExternalLink from 'calypso/components/external-link';

const Container = styled.div`
	display: flex;
	flex-direction: column;
	align-items: flex-start;
	padding: ${ ( props ) => ( props.first ? '0 0 40px' : '40px 0' ) };
	border-bottom: ${ ( props ) => ( props.last ? 'none' : '1px solid var( --studio-gray-5 )' ) };
`;

const Icon = styled.img`
	margin-bottom: 12px;
`;
const Title = styled.div`
	color: var( --studio-gray-100 );
	font-weight: 600;
	font-size: 16px;
	margin-bottom: 12px;
`;
const Description = styled.div`
	color: var( --studio-gray-60 );
	margin-bottom: 12px;
`;

const PluginDetailsSidebarUSP = ( { icon, title, description, links, first, last } ) => {
	return (
		<Container key={ title } first={ first } last={ last }>
			<Icon src={ icon.src } width={ icon.width } />
			<Title>{ title }</Title>
			<Description>{ description }</Description>
			{ links &&
				links.map( ( link ) => {
					return (
						<ExternalLink icon href={ link.href }>
							{ link.label }
						</ExternalLink>
					);
				} ) }
		</Container>
	);
};

export default PluginDetailsSidebarUSP;
