import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import FormattedHeader from 'calypso/components/formatted-header';
import { BrowserView } from 'calypso/signup/difm/components/BrowserView';
import {
	HOME_PAGE,
	BLOG_PAGE,
	CONTACT_PAGE,
	ABOUT_PAGE,
	PHOTO_GALLERY_PAGE,
	SERVICE_SHOWCASE_PAGE,
	VIDEO_GALLERY_PAGE,
	PODCAST_PAGE,
	PORTFOLIO_PAGE,
	FAQ_PAGE,
	SITEMAP_PAGE,
	PROFILE_PAGE,
	PAGE_LIMIT,
} from 'calypso/signup/difm/constants';
import { useTranslatedPageTitles } from 'calypso/signup/difm/translation-hooks';
import StepWrapper from 'calypso/signup/step-wrapper';

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

interface PageCellType {
	pageId: string;
	selectedPages: string[];
	onClick: ( pageId: string ) => void;
	popular?: boolean;
}

function PageCell( { pageId, popular, selectedPages, onClick }: PageCellType ) {
	const translate = useTranslate();
	const selectedIndex = selectedPages.indexOf( pageId );
	const totalSelections = selectedPages.length;
	const isSelected = Boolean( selectedIndex > -1 );
	const isDisabled = selectedIndex === -1 && totalSelections >= PAGE_LIMIT;
	const title = useTranslatedPageTitles( pageId );

	return (
		<GridCellContainer
			onClick={ () => onClick( pageId ) }
			isSelected={ isSelected }
			isClickDisabled={ isDisabled }
		>
			<BrowserView
				pageId={ pageId }
				isClickDisabled={ isDisabled }
				isSelected={ isSelected }
				selectedIndex={ selectedIndex >= 0 ? selectedIndex : -1 }
			/>
			<CellLabelContainer>
				<div>{ title }</div>
				{ popular ? (
					<PopularContainer>
						<div>{ translate( 'Popular' ) }</div>
					</PopularContainer>
				) : null }
			</CellLabelContainer>
		</GridCellContainer>
	);
}

function PageSelector() {
	const [ selectedPages, setSelectedPages ] = useState< string[] >( [] );
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
				<PageCell
					popular
					pageId={ HOME_PAGE }
					selectedPages={ selectedPages }
					onClick={ onPageClick }
				/>
				<PageCell
					popular
					pageId={ BLOG_PAGE }
					selectedPages={ selectedPages }
					onClick={ onPageClick }
				/>
				<PageCell
					popular
					pageId={ CONTACT_PAGE }
					selectedPages={ selectedPages }
					onClick={ onPageClick }
				/>
				<PageCell
					popular
					pageId={ ABOUT_PAGE }
					selectedPages={ selectedPages }
					onClick={ onPageClick }
				/>
				<PageCell
					pageId={ PHOTO_GALLERY_PAGE }
					selectedPages={ selectedPages }
					onClick={ onPageClick }
				/>
				<PageCell
					pageId={ SERVICE_SHOWCASE_PAGE }
					selectedPages={ selectedPages }
					onClick={ onPageClick }
				/>
				<PageCell
					pageId={ VIDEO_GALLERY_PAGE }
					selectedPages={ selectedPages }
					onClick={ onPageClick }
				/>
				<PageCell pageId={ PODCAST_PAGE } selectedPages={ selectedPages } onClick={ onPageClick } />
				<PageCell
					pageId={ PORTFOLIO_PAGE }
					selectedPages={ selectedPages }
					onClick={ onPageClick }
				/>
				<PageCell pageId={ FAQ_PAGE } selectedPages={ selectedPages } onClick={ onPageClick } />
				<PageCell pageId={ SITEMAP_PAGE } selectedPages={ selectedPages } onClick={ onPageClick } />
				<PageCell pageId={ PROFILE_PAGE } selectedPages={ selectedPages } onClick={ onPageClick } />
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
			stepContent={ <PageSelector /> }
			hideSkip
			align="left"
			isHorizontalLayout={ true }
			isWideLayout={ false }
			{ ...props }
		/>
	);
}
