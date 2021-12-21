import styled from '@emotion/styled';
import ExternalLink from 'calypso/components/external-link';

const Container = styled.div`
	display: flex;
	flex-direction: column;
	padding: ${ ( props ) => ( props.first ? '0 0 40px' : '40px 0' ) };
	border-bottom: ${ ( props ) => ( props.last ? 'none' : '1px solid var( --studio-gray-5 )' ) };
`;

const Icon = styled.div`
	margin-bottom: 10px;
`;
const Title = styled.div`
	color: var( --studio-gray-100 )
	font-weight: 600;
	font-size: 16px;
	margin-bottom: 10px;
`;
const Description = styled.div`
	display: flex;
	flex-direction: column;
`;
// const Link = styled.a`
// 	display: flex;
// 	flex-direction: column;
// `;

const PluginDetailsSidebarUSP = ( { icon, title, description, links, first, last } ) => {
	return (
		<Container first={ first } last={ last }>
			<Icon>{ icon }</Icon>
			<Title>{ title }</Title>
			<Description>{ description }</Description>
			{ links.map( ( link ) => {
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
