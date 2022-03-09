import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';
import FooterSection from 'calypso/components/footer-section';
import LinkCard from 'calypso/components/link-card'; // should we host this one inside footer-section?

interface Article {
	title: string;
	category: string;
	url: string;
	background: string;
}

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

const EducationFooter = () => {
	const translate = useTranslate();

	const articles: Article[] = [
		{
			category: translate( 'website-building', {
				comment:
					'Wordpress.com Go article (https://wordpress.com/go/) category on kebab case, example: Website Building = website-bulding',
				textOnly: true,
			} ),
			title: translate( 'What Are WordPress Plugins and Themes? (A Beginner’s Guide)', {
				comment: 'Wordpress.com Go article title (https://wordpress.com/go/)',
				textOnly: true,
			} ),
			url:
				'https://wordpress.com/go/website-building/what-are-wordpress-plugins-and-themes-a-beginners-guide/',
			background: 'studio-celadon-60',
		},
		{
			category: translate( 'customization', {
				comment:
					'Wordpress.com Go article (https://wordpress.com/go/) category on kebab case, example: Website Building = website-bulding',
				textOnly: true,
			} ),
			title: translate( 'How to Choose WordPress Plugins for Your Website (7 Tips)', {
				comment: 'Wordpress.com Go article title (https://wordpress.com/go/)',
				textOnly: true,
			} ),
			url:
				'https://wordpress.com/go/customization/how-to-choose-wordpress-plugins-for-your-website-7-tips/',
			background: 'studio-purple-80',
		},
		{
			category: translate( 'seo', {
				comment:
					'Wordpress.com Go article (https://wordpress.com/go/) category on kebab case, example: Website Building = website-bulding',
				textOnly: true,
			} ),
			title: translate( 'Do You Need to Use SEO Plugins on Your WordPress.com Site?', {
				comment: 'Wordpress.com Go article title (https://wordpress.com/go/)',
				textOnly: true,
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
