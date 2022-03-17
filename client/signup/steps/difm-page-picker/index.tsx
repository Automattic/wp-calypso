import { Button } from '@automattic/components';
import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
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
import './style.scss';

const PageGrid = styled.div`
	display: grid;
	grid-template-columns: 1fr;
	row-gap: 20px;
	column-gap: 35px;
	margin: 0 0 30px;

	@media ( min-width: 960px ) and ( max-width: 1200px ) {
		grid-template-columns: 1fr 1fr;
		column-gap: 15px;
		row-gap: 25px;
	}

	@media ( min-width: 1200px ) {
		grid-template-columns: 1fr 1fr 1fr;
		row-gap: 40px;
		column-gap: 35px;
	}
`;

const GridCellContainer = styled.div< { isClickDisabled: boolean; isSelected: boolean } >`
	cursor: ${ ( { isClickDisabled, isSelected } ) =>
		! isSelected && isClickDisabled ? 'default' : 'pointer' };
	opacity: ${ ( { isSelected, isClickDisabled } ) =>
		! isSelected && isClickDisabled ? '0.4' : '1' };
	border-radius: 4px;
	position: relative;
	width: 100%;
	position: relative;
	display: flex;
	flex-direction: column;
	align-items: center;
	font-weight: 500;
`;

const CellLabelContainer = styled.div`
	margin: 14px 0;
	text-align: left;
	display: flex;
	justify-content: center;
	align-items: center;
	font-size: 14px;
	& > div {
		margin-right: 8px;
	}
	width: 100%;
	@media ( min-width: 960px ) {
		justify-content: left;
	}
`;

const PopularContainer = styled.div`
	background: #b8e6bf;
	border-radius: 4px;
	text-align: center;
	font-size: 12px;
	padding: 0;
	line-height: 20px;
	font-weight: 500;
	color: #00450c;
	height: 20px;
	width: 61px;
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
				{ popular ? <PopularContainer>{ translate( 'Popular' ) }</PopularContainer> : null }
			</CellLabelContainer>
		</GridCellContainer>
	);
}

function PageSelector() {
	const [ selectedPages, setSelectedPages ] = useState< string[] >( [
		HOME_PAGE,
		ABOUT_PAGE,
		CONTACT_PAGE,
	] );

	const onPageClick = ( pageId: string ) => {
		const foundIndex = selectedPages.indexOf( pageId );
		if ( pageId !== HOME_PAGE )
			if ( foundIndex > -1 ) {
				// The home page cannot be touched
				const tempArray = [ ...selectedPages ];
				tempArray.splice( foundIndex, 1 );
				setSelectedPages( tempArray );
			} else if ( selectedPages.length !== PAGE_LIMIT ) {
				setSelectedPages( [ ...selectedPages, pageId ] );
			}
	};

	return (
		<>
			<PageGrid>
				<PageCell
					popular
					pageId={ HOME_PAGE }
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
					popular
					pageId={ CONTACT_PAGE }
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
		</>
	);
}

interface StepProps {
	stepSectionName: string | null;
	stepName: string;
	goToStep: () => void;
	goToNextStep: () => void;
}

const StyledButton = styled( Button )`
	&.button.is-primary {
		padding: 10px;
		font-weight: 500;
		font-size: 14px;
		line-height: 20px;
		padding: 10px 27px 10px 28px;
		border-radius: 4px;
	}
`;

export default function DIFMPagePicker( props: StepProps ) {
	const translate = useTranslate();

	return (
		<StepWrapper
			headerText={ translate( 'Add pages to your {{wbr}}{{/wbr}}website', {
				components: { wbr: <wbr /> },
			} ) }
			subHeaderText={ translate( 'You can add up to 5 pages' ) }
			stepContent={ <PageSelector /> }
			hideSkip
			align="left"
			isHorizontalLayout={ true }
			isWideLayout={ false }
			headerButton={
				<StyledButton compact primary>
					{ translate( 'Go to Checkout' ) }
				</StyledButton>
			}
			{ ...props }
		/>
	);
}
