import styled from '@emotion/styled';
import ExternalLink from 'calypso/components/external-link';
import FoldableCard from 'calypso/components/foldable-card';

const Container = styled( FoldableCard )`
	display: flex;
	flex-direction: column;
	align-items: flex-start;

	box-shadow: none;

	.foldable-card__header {
		display: none;
	}

	&.is-expanded .foldable-card__content {
		width: 100%;
		${ ( props ) => props.first && 'border-top: 0' };
		padding: ${ ( props ) => ( props.first ? '0 0 32px' : '32px 0' ) };
	}
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

const PluginDetailsSidebarUSP = ( { key, icon, title, description, links, first } ) => {
	const Header = () => {
		return (
			<>
				<Icon src={ icon.src } width={ icon.width } />
				<Title>{ title }</Title>
			</>
		);
	};
	return (
		<Container key={ key } header={ <Header /> } expanded first={ first }>
			<Header />
			<Description>{ description }</Description>
			{ links &&
				links.map( ( link ) => {
					return (
						<>
							<ExternalLink icon href={ link.href }>
								{ link.label }
							</ExternalLink>
							<br />
						</>
					);
				} ) }
		</Container>
	);
};

export default PluginDetailsSidebarUSP;
