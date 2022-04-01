import styled from '@emotion/styled';
import {
	ABOUT_PAGE,
	BLOG_PAGE,
	CONTACT_PAGE,
	HOME_PAGE,
	PHOTO_GALLERY_PAGE,
	SERVICE_SHOWCASE_PAGE,
	SITEMAP_PAGE,
} from 'calypso/signup/difm/constants';
import aboutPage from 'calypso/signup/difm/images/page-descriptions/about-page.svg';
import blogPage from 'calypso/signup/difm/images/page-descriptions/blog-page.svg';
import contactPage from 'calypso/signup/difm/images/page-descriptions/contact-page.svg';
import homePage from 'calypso/signup/difm/images/page-descriptions/home-page.svg';
import photoGallery from 'calypso/signup/difm/images/page-descriptions/photo-gallery.svg';
import serviceShowcase from 'calypso/signup/difm/images/page-descriptions/service-showcase.svg';
import threeDots from 'calypso/signup/difm/images/three-dots.svg';

const Container = styled.div< { isSelected?: boolean; isClickDisabled?: boolean } >`
	border: 1px solid
		${ ( { isSelected } ) => ( isSelected ? 'var( --studio-white )' : 'var( --studio-gray-10 )' ) };
	box-shadow: 0px 0px 0px
		${ ( { isSelected } ) => {
			if ( isSelected ) {
				return '2px var( --studio-blue-50 )';
			}
			return '1px var( --studio-white )';
		} };
	border-radius: 7px;
	transition: box-shadow 400ms ease-in-out;
	&:hover {
		border: 1px solid
			${ ( { isClickDisabled, isSelected } ) => {
				if ( isClickDisabled ) {
					return 'var( --studio-gray-10 )';
				} else if ( isSelected ) {
					return 'var( --studio-white )';
				}
				return 'var( --studio-gray-50 )';
			} };

		box-shadow: ${ ( { isClickDisabled, isSelected } ) => {
			if ( isSelected ) {
				return '0px 0px 0px 2px var( --studio-blue-50 )';
			} else if ( isClickDisabled ) {
				return 'none';
			}
			return '0px 0px 0px 3px #E3EAF0';
		} };
	}
	width: 222px;
	height: 170px;
	position: relative;
	cursor: ${ ( { isClickDisabled } ) => ( isClickDisabled ? 'default' : 'pointer' ) }; ;
`;

const HeaderContainer = styled.div< { isSelected?: boolean; isClickDisabled?: boolean } >`
    height: 7px;
    position: relative;
    border-radius: 6px;
    padding: 5px 0 0px 6.5px;
	img {
    	position: absolute;
	}
}`;

const Line = styled.div< { isSelected?: boolean; isClickDisabled?: boolean } >`
	height: 0.75px;
    background-color: var( --studio-gray-10 );
    position: absolute;
	width: ${ ( { isSelected } ) => ( isSelected ? '224px' : '222px' ) };
	left: ${ ( { isSelected } ) => ( isSelected ? '-1px' : '0' ) };
    top: 12px;
	&:hover{
		width: ${ ( { isSelected } ) => ( isSelected ? '224px' : '221px' ) };
	}
}`;

function Header( props: { isSelected?: boolean; isClickDisabled?: boolean } ) {
	return (
		<HeaderContainer { ...props }>
			<img src={ threeDots } alt="three dots" />
			<Line { ...props } />
		</HeaderContainer>
	);
}

const Content = styled.div`
	display: flex;
	align-items: center;
	justify-content: center;
	height: 157px;
`;

const SelectedCount = styled.div`
	color: var( --studio-white );
	background-color: var( --studio-blue-50 );
	width: 25px;
	height: 25px;
	border-radius: 15px;
	display: flex;
	align-items: center;
	justify-content: center;
	position: absolute;
	right: 7px;
	bottom: 5px;
`;

export function BrowserView( {
	pageId,
	isSelected,
	isClickDisabled,
	selectedIndex,
	onClick,
}: {
	pageId: string;
	isSelected?: boolean;
	isClickDisabled?: boolean;
	selectedIndex: number;
	onClick: () => void;
} ) {
	const getPageImage = () => {
		switch ( pageId ) {
			case ABOUT_PAGE:
				return aboutPage;
			case BLOG_PAGE:
				return blogPage;
			case CONTACT_PAGE:
			case SITEMAP_PAGE:
				return contactPage;
			case HOME_PAGE:
				return homePage;
			case PHOTO_GALLERY_PAGE:
				return photoGallery;
			case SERVICE_SHOWCASE_PAGE:
				return serviceShowcase;
			default:
				return homePage;
		}
	};

	const selectionProps = { isSelected, isClickDisabled };
	return (
		<Container { ...selectionProps } onClick={ onClick }>
			{ selectedIndex > -1 ? <SelectedCount>{ selectedIndex + 1 }</SelectedCount> : null }
			<Header { ...selectionProps } />
			<Content>
				<img src={ getPageImage() } alt="page preview" />
			</Content>
		</Container>
	);
}
