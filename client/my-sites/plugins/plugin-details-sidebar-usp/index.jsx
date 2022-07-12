import { useBreakpoint } from '@automattic/viewport-react';
import styled from '@emotion/styled';
import { Fragment } from 'react';
import ExternalLink from 'calypso/components/external-link';
import FoldableCard from 'calypso/components/foldable-card';

const Container = styled( FoldableCard )`
	display: flex;
	flex-direction: column;
	align-items: flex-start;
	width: 100%;
	margin-bottom: 0;
	box-shadow: none;
	${ ( props ) => props.showAsAccordion && 'border-top: 1px solid var( --studio-gray-5)' };
	${ ( props ) => props.showAsAccordion && props.first && 'border-top: 0' };
	.foldable-card__content {
		width: 100%;
	}

	.foldable-card__header {
		padding-left: 0;
		padding-right: 0;
		${ ( props ) => ! props.showAsAccordion && 'display: none' };
	}

	&.is-expanded .foldable-card__content {
		${ ( props ) => props.first && 'border-top: 0' };
		${ ( props ) => props.showAsAccordion && 'border: 0' };
		padding: ${ ( props ) => ( props.first ? '0 0 32px' : '32px 0' ) };
		${ ( props ) => props.showAsAccordion && 'padding: 0' };
	}
`;

const Icon = styled.img`
	margin-right: 6px;
	width: 32px;
	height: 24px;
	${ ( props ) => ! props.showAsAccordion && 'margin-bottom: 12px;' };
`;
const Title = styled.div`
	color: var( --studio-gray-100 );
	font-size: 16px;
	${ ( props ) => ! props.showAsAccordion && 'font-weight: 600' };
	${ ( props ) => ! props.showAsAccordion && 'margin-bottom: 12px;' };
`;
const Description = styled.div`
	color: var( --studio-gray-60 );
	margin-bottom: 12px;
`;

const PluginDetailsSidebarUSP = ( {
	id,
	title,
	description,
	icon = undefined,
	links = undefined,
	first = false,
} ) => {
	const isNarrow = useBreakpoint( '<1040px' );
	const Header = () => {
		return (
			<>
				{ icon && (
					<>
						<Icon src={ icon.src } showAsAccordion={ isNarrow } />
						&nbsp;
					</>
				) }

				<Title showAsAccordion={ isNarrow }>{ title }</Title>
			</>
		);
	};
	return (
		<Container
			key={ id }
			header={ <Header /> }
			expanded={ ! isNarrow }
			showAsAccordion={ isNarrow }
			first={ first }
		>
			{ ! isNarrow && <Header /> }
			<Description>{ description }</Description>
			{ links &&
				links.map( ( link, idx ) => {
					return (
						<Fragment key={ idx }>
							<ExternalLink icon href={ link.href }>
								{ link.label }
							</ExternalLink>
							<br />
						</Fragment>
					);
				} ) }
		</Container>
	);
};

export default PluginDetailsSidebarUSP;
