import { Button } from '@automattic/components';
import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
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
import { saveSignupStep, submitSignupStep } from 'calypso/state/signup/progress/actions';

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
	cursor: default;
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
	gap: 8px;

	width: 100%;
	@media ( min-width: 960px ) {
		justify-content: left;
	}
`;

const PopularContainer = styled.div`
	background: var( --studio-green-5 );
	border-radius: 4px;
	text-align: center;
	font-size: 12px;
	padding: 0;
	line-height: 20px;
	font-weight: 500;
	color: var( --studio-green-80 );
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
	const title = useTranslatedPageTitles()[ pageId ];

	return (
		<GridCellContainer isSelected={ isSelected } isClickDisabled={ isDisabled }>
			<BrowserView
				onClick={ () => onClick( pageId ) }
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

function PageSelector( {
	selectedPages,
	setSelectedPages,
}: {
	selectedPages: string[];
	setSelectedPages: ( pages: string[] ) => void;
} ) {
	const onPageClick = ( pageId: string ) => {
		const foundIndex = selectedPages.indexOf( pageId );
		// The home page cannot be touched
		if ( pageId !== HOME_PAGE ) {
			if ( foundIndex > -1 ) {
				setSelectedPages( selectedPages.filter( ( page, index ) => index !== foundIndex ) );
			} else if ( selectedPages.length !== PAGE_LIMIT ) {
				setSelectedPages( [ ...selectedPages, pageId ] );
			}
		}
	};

	return (
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
			<PageCell pageId={ PORTFOLIO_PAGE } selectedPages={ selectedPages } onClick={ onPageClick } />
			<PageCell pageId={ FAQ_PAGE } selectedPages={ selectedPages } onClick={ onPageClick } />
			<PageCell pageId={ SITEMAP_PAGE } selectedPages={ selectedPages } onClick={ onPageClick } />
			<PageCell pageId={ PROFILE_PAGE } selectedPages={ selectedPages } onClick={ onPageClick } />
		</PageGrid>
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
		padding: 10px 27px 10px 28px;
	}
`;

export default function DIFMPagePicker( props: StepProps ) {
	const { stepName, goToNextStep } = props;

	const translate = useTranslate();
	const dispatch = useDispatch();
	const [ selectedPages, setSelectedPages ] = useState< string[] >( [
		HOME_PAGE,
		ABOUT_PAGE,
		CONTACT_PAGE,
	] );

	useEffect( () => {
		dispatch( saveSignupStep( { stepName } ) );
	}, [] );

	const submitPickedPages = () => {
		dispatch( submitSignupStep( { stepName }, { selectedPageTitles: selectedPages } ) );
		goToNextStep();
	};

	const headerText = translate( 'Add pages to your {{wbr}}{{/wbr}}website', {
		components: { wbr: <wbr /> },
	} );
	const subHeaderText = translate( 'You can add up to 5 pages' );
	return (
		<StepWrapper
			headerText={ headerText }
			fallbackHeaderText={ headerText }
			subHeaderText={ subHeaderText }
			fallbackSubHeaderText={ subHeaderText }
			stepContent={
				<PageSelector selectedPages={ selectedPages } setSelectedPages={ setSelectedPages } />
			}
			hideSkip
			align="left"
			isHorizontalLayout={ true }
			isWideLayout={ false }
			headerButton={
				<StyledButton primary onClick={ submitPickedPages }>
					{ translate( 'Go to Checkout' ) }
				</StyledButton>
			}
			{ ...props }
		/>
	);
}
