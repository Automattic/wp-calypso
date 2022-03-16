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
import aboutPage from 'calypso/signup/difm/images/about-page.svg';
import blogPage from 'calypso/signup/difm/images/blog-page.svg';
import contactPage from 'calypso/signup/difm/images/contact-page.svg';
import homePage from 'calypso/signup/difm/images/home-page.svg';
import photoGallery from 'calypso/signup/difm/images/photo-gallery.svg';
import serviceShowcase from 'calypso/signup/difm/images/service-showcase.svg';

const Container = styled.div< { isSelected?: boolean; isClickDisabled?: boolean } >`
	border: 3px solid
		${ ( { isSelected } ) => ( isSelected ? 'var( --studio-blue-50 )' : '#ffffff00' ) };
	border-radius: 10px;
	transition: border 0.2s cubic-bezier( 0.11, 0, 0.5, 0 );
	&:hover {
		border: 3px solid
			${ ( { isClickDisabled, isSelected } ) => {
				if ( isClickDisabled && ! isSelected ) {
					return 'var( --studio-white )';
				}
				return 'var( --studio-blue-50 )';
			} };
		border-radius: 10px;
	}
	width: 222px;
	position: relative;
`;

const Header = styled.div`
	display: flex;
	align-items: center;
	justify-content: left;
	position: relative;
	width: 222px;
	height: 12px;
	border: 1px solid rgba( 0, 0, 0, 0.12 );
	border-radius: 6px 6px 0 0;
	margin: 0 auto;
	box-sizing: border-box;
	padding: 5px;
`;

const Content = styled.div`
	border: 1px solid rgba( 0, 0, 0, 0.12 );
	border-top: none;
	display: flex;
	align-items: center;
	justify-content: center;
	height: 170px;
	border-radius: 0 0 4px 4px;
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
	right: 7px;
	bottom: 5px;
`;

export function BrowserView( {
	pageId,
	isSelected,
	isClickDisabled,
	selectedIndex,
}: {
	pageId: string;
	isSelected?: boolean;
	isClickDisabled?: boolean;
	selectedIndex: number;
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

	return (
		<Container isSelected={ isSelected } isClickDisabled={ isClickDisabled }>
			{ selectedIndex > -1 ? <SelctedCount>{ selectedIndex + 1 }</SelctedCount> : null }

			<Header>
				<svg width={ 16 } height={ 4 } fill="none" xmlns="http://www.w3.org/2000/svg">
					<path
						d="M3.771 1.645c0 .909-.729 1.645-1.628 1.645-.9 0-1.629-.736-1.629-1.645C.514.737 1.244 0 2.143 0c.9 0 1.628.737 1.628 1.645ZM9.743 1.645c0 .909-.73 1.645-1.629 1.645-.9 0-1.628-.736-1.628-1.645C6.486.737 7.215 0 8.114 0c.9 0 1.629.737 1.629 1.645ZM15.714 1.645c0 .909-.729 1.645-1.628 1.645-.9 0-1.629-.736-1.629-1.645 0-.908.73-1.645 1.629-1.645s1.628.737 1.628 1.645Z"
						fill="#000"
						fillOpacity={ 0.12 }
					/>
				</svg>
			</Header>
			<Content>
				<img src={ getPageImage() } alt="page preview" />
			</Content>
		</Container>
	);
}
