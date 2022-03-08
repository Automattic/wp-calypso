import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';
import FooterSection from 'calypso/components/footer-section';

import './style.scss';

const deslugify = ( string: string ) => string.replaceAll( '-', ' ' );
const slugify = ( string: string ) =>
	string
		.replace( /[&/\\#,+()$~%.'":*?<>{}’]/g, '' )
		.toLowerCase()
		.replaceAll( ' ', '-' );

const ArticleLinksContainer = styled.div`
	@media ( max-width: 960px ) {
		grid-template-columns: repeat( 1, 1fr );
	}

	@media ( max-width: 660px ) {
		padding: 0 16px;
	}

	display: grid;
	grid-template-columns: repeat( 3, 1fr );
	column-gap: 29px;
	row-gap: 10px;
`;

const LinkCardContainer = styled.div`
	border-radius: 5px;
	padding: 24px;
	background: var( --${ ( props ) => props.background } );
`;

const LinkCardLabel = styled.div`
	margin-bottom: 8px;
	font-size: var( --scss-font-body-extra-small );
	color: var( --color-text-inverted );
	line-height: 1.25rem;
	text-transform: capitalize;
`;

const LinkCardTitle = styled.div`
	@media ( max-width: 1090px ) {
		-webkit-line-clamp: 4; // trunk text to 3 lines then ellipsis
		line-clamp: 4;
	}

	margin-bottom: 32px;
	font-size: var( --scss-font-title-small );
	color: var( --color-text-inverted );
	text-overflow: ellipsis;
	word-wrap: break-word;
	overflow: hidden;
	display: -webkit-box;
	-webkit-line-clamp: 3; // trunk text to 3 lines then ellipsis
	line-clamp: 3;
	-webkit-box-orient: vertical;
	line-height: 1.5rem;
`;

const LinkCardCta = styled.div`
	font-size: var( --scss-font-body-small );
	color: var( --color-text-inverted );
	line-height: 1.25rem;
`;

const LinkCard = ( props ) => {
	const { label, title, cta, background, url } = props;

	return (
		<a href={ url }>
			<LinkCardContainer background={ background }>
				<LinkCardLabel>{ label }</LinkCardLabel>
				<LinkCardTitle>{ title }</LinkCardTitle>
				<LinkCardCta>{ cta }</LinkCardCta>
			</LinkCardContainer>
		</a>
	);
};

const EducationFooter = () => {
	const translate = useTranslate();

	const articles = [
		{
			category: translate( 'website-building', {
				comment:
					'Wordpress.com Go article (https://wordpress.com/go/) category on kebab case, example: Website Building = website-bulding',
			} ),
			title: translate( 'What Are WordPress Plugins and Themes? (A Beginner’s Guide)', {
				comment: 'Wordpress.com Go article title (https://wordpress.com/go/)',
			} ),
			url:
				'https://wordpress.com/go/website-building/what-are-wordpress-plugins-and-themes-a-beginners-guide/',
			background: 'studio-celadon-60',
		},
		{
			category: translate( 'customization', {
				comment:
					'Wordpress.com Go article (https://wordpress.com/go/) category on kebab case, example: Website Building = website-bulding',
			} ),
			title: translate( 'How to Choose WordPress Plugins for Your Website (7 Tips)', {
				comment: 'Wordpress.com Go article title (https://wordpress.com/go/)',
			} ),
			url:
				'https://wordpress.com/go/customization/how-to-choose-wordpress-plugins-for-your-website-7-tips/',
			background: 'studio-purple-80',
		},
		{
			category: translate( 'seo', {
				comment:
					'Wordpress.com Go article (https://wordpress.com/go/) category on kebab case, example: Website Building = website-bulding',
			} ),
			title: translate( 'Do You Need to Use SEO Plugins on Your WordPress.com Site?', {
				comment: 'Wordpress.com Go article title (https://wordpress.com/go/)',
			} ),
			url:
				'https://wordpress.com/go/tips/do-you-need-to-use-seo-plugins-on-your-wordpress-com-site/',
			background: 'studio-wordpress-blue-80',
		},
	];

	return (
		<FooterSection header={ translate( 'Learn More' ) }>
			<ArticleLinksContainer>
				{ articles.map( ( article ) => (
					<LinkCard
						key={ slugify( article.title ) } //TODO: find a proper util or add this one
						label={ deslugify( article.category ) } //TODO: find a proper util or add this one
						title={ article.title }
						url={ article.url }
						background={ article.background }
						cta={ translate( 'Read More' ) }
					/>
				) ) }
			</ArticleLinksContainer>
		</FooterSection>
	);
};

export default EducationFooter;
