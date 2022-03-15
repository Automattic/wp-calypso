import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import FormattedHeader from 'calypso/components/formatted-header';
import { BrowserView } from 'calypso/signup/difm/components/BrowserView';
import usePageSuggestions, { PageSuggestion } from 'calypso/signup/difm/usePageSuggestions';
import StepWrapper from 'calypso/signup/step-wrapper';
import './styles.scss';

const PagePickerDetailsContainer = styled.div`
	margin: 10px 0 50px 0;
	width: 100%;
	@media ( min-width: 600px ) {
		width: 395px;
	}
`;

const PageGrid = styled.div`
	display: grid;
	grid-template-columns: 1fr;
	row-gap: 40px;
	column-gap: 35px;
	margin: 0 0 30px;

	@media ( min-width: 600px ) and ( max-width: 785px ) {
		grid-template-columns: 1fr 1fr;
	}

	@media ( min-width: 785px ) {
		grid-template-columns: 1fr 1fr 1fr;
	}
`;

const Container = styled.div`
	display: block;
	align-items: flex-start;
	flex-direction: row;
	padding: 0 5px;
	@media ( min-width: 960px ) {
		display: flex;
	}
`;

const GridCellContainer = styled.div< { isClickDisabled: boolean; isSelected: boolean } >`
	cursor: ${ ( { isClickDisabled, isSelected } ) =>
		! isSelected && isClickDisabled ? 'default' : 'pointer' };
	opacity: ${ ( { isSelected, isClickDisabled } ) =>
		! isSelected && isClickDisabled ? '0.4' : '1' };
	min-width: 223px;
	border-radius: 4px;
	position: relative;
	width: 100%;
	position: relative;
	display: flex;
	flex-direction: column;
	align-items: center;
`;

const CellLabelContainer = styled.div`
	margin: 14px 0;
	text-align: left;
	display: flex;

	justify-content: center;
	& > div {
		margin-right: 8px;
	}
	width: 100%;
	@media ( min-width: 960px ) {
		justify-content: left;
	}
`;

const PopularContainer = styled.div`
	width: 75px;
	height: 25px;
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

interface PageCellType extends PageSuggestion {
	selectedCount?: number;
	onClick: () => void;
	isDisabled: boolean;
}

function PageCell( { id, title, isPopular, selectedCount, onClick, isDisabled }: PageCellType ) {
	const translate = useTranslate();
	const isSelected = Boolean( selectedCount && selectedCount > 0 );
	return (
		<GridCellContainer onClick={ onClick } isSelected={ isSelected } isClickDisabled={ isDisabled }>
			<BrowserView
				pageId={ id }
				isClickDisabled={ isDisabled }
				isSelected={ isSelected }
				selectedCount={ selectedCount }
			/>
			<CellLabelContainer>
				<div>{ title }</div>
				{ isPopular ? (
					<PopularContainer>
						<div>{ translate( 'Popular' ) }</div>
					</PopularContainer>
				) : null }
			</CellLabelContainer>
		</GridCellContainer>
	);
}

function PageSelector() {
	const PAGE_LIMIT = 5;
	const [ selectedPages, setSelectedPages ] = useState< string[] >( [] );
	const selectedPageCount = selectedPages.length;
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
							isDisabled={ selectedPageCount >= PAGE_LIMIT }
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
