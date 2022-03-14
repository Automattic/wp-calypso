import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import FormattedHeader from 'calypso/components/formatted-header';
import { BrowserView } from 'calypso/signup/difm/components/BrowserVIew';
import usePageSuggestions, { PageSuggestion } from 'calypso/signup/difm/usePageSuggestions';
import StepWrapper from 'calypso/signup/step-wrapper';

const PagePickerDetailsContainer = styled.div`
	width: 400px;
	padding-right: 2rem;
`;

const PageGrid = styled.div`
	display: grid;
	grid-template-columns: 1fr;
	row-gap: 74px;
	column-gap: 24px;
	margin: 0 0 30px;
	@media ( min-width: 960px ) {
		grid-template-columns: 1fr 1fr 1fr;
	}
`;

const Container = styled.div`
	display: flex;
	align-items: flex-start;
	flex-direction: row;
`;

const GridCellContainer = styled.button`
	cursor: pointer;
	width: 223px;
	border-radius: 4px;
	position: relative;
`;

const CellLabelContainer = styled.div`
	margin: 14px 0;
	text-align: left;
	display: flex;
	& > div {
		margin-right: 8px;
	}
`;

const PopularContainer = styled.div`
	width: 61px;
	height: 20px;
	left: 699px;
	top: 352px;
	background: #b8e6bf;
	opacity: 0.64;
	border-radius: 4px;
	text-align: center;
	& > div {
		color: #00450c;
		font-weight: 500;
		text-align: center;
	}
`;

const SelctedCount = styled.div`
	color: var( --studio-white );
	background-color: var( --studio-blue-50 );
	width: 25px;
	height: 25px;
	border-radius: 15px;
	display: flex;
	align-items: center;
	justify-content: center;
	position: absolute;
	right: 14px;
	top: 140px;
`;

interface PageCellType extends PageSuggestion {
	selectedCount?: number;
	onClick: () => void;
}

function PageCell( { title, isPopular, selectedCount, onClick }: PageCellType ) {
	const translate = useTranslate();

	return (
		<GridCellContainer onClick={ onClick }>
			<BrowserView isSelected={ selectedCount ? selectedCount > 0 : false } />
			<CellLabelContainer>
				<div>{ title }</div>
				{ isPopular ? (
					<PopularContainer>
						<div>{ translate( 'Popular' ) }</div>
					</PopularContainer>
				) : null }
			</CellLabelContainer>
			{ selectedCount ? <SelctedCount>{ selectedCount }</SelctedCount> : null }
		</GridCellContainer>
	);
}

function PageSelector() {
	const PAGE_LIMIT = 5;
	const [ selectedPages, setSelectedPages ] = useState< string[] >( [] );
	const translatedPageTitles = usePageSuggestions();
	const translate = useTranslate();

	const onPageClick = ( pageId: string ) => {
		const foundIndex = selectedPages.indexOf( pageId );

		if ( foundIndex > -1 ) {
			const tempArray = [ ...selectedPages ];
			tempArray.splice( foundIndex, 1 );
			setSelectedPages( tempArray );
		} else if ( selectedPages.length !== PAGE_LIMIT ) {
			setSelectedPages( [ ...selectedPages, pageId ] );
		}
	};

	return (
		<Container>
			<PagePickerDetailsContainer>
				<FormattedHeader
					headerText={ translate( 'Add pages to your website' ) }
					subHeaderText={ translate( 'You can add up to 5 pages' ) }
					align="left"
				/>
			</PagePickerDetailsContainer>
			<PageGrid>
				{ Object.values( translatedPageTitles ).map( ( page: PageSuggestion ) => {
					const index = selectedPages.indexOf( page.id );
					return (
						<PageCell
							{ ...page }
							selectedCount={ index > -1 ? index + 1 : undefined }
							onClick={ () => onPageClick( page.id ) }
						/>
					);
				} ) }
			</PageGrid>
		</Container>
	);
}

interface StepProps {
	stepSectionName: string | null;
	stepName: string;
	goToStep: () => void;
	goToNextStep: () => void;
}

export default function DIFMPagePicker( props: StepProps ) {
	return (
		<StepWrapper
			hideFormattedHeader
			skipLabelText={ true }
			stepContent={ <PageSelector /> }
			hideSkip
			align="left"
			isHorizontalLayout={ true }
			isWideLayout={ false }
			{ ...props }
		/>
	);
}
