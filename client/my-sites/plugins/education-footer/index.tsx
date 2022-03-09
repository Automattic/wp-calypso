import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';
import LinkCard from 'calypso/components/link-card'; // should we host this one inside footer-section?
import Section from 'calypso/components/section';

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

	return (
		<Section header={ translate( 'Learn more' ) }>
			<ArticleLinksContainer>
				<LinkCard
					label={ translate( 'Website Building', {
						comment: 'Wordpress.com Go article (https://wordpress.com/go/) category.',
						textOnly: true,
					} ) }
					title={ translate( 'What Are WordPress Plugins and Themes? (A Beginner’s Guide)', {
						comment: 'Wordpress.com Go article title (https://wordpress.com/go/)',
						textOnly: true,
					} ) }
					cta={ translate( 'Read More' ) }
					url="https://wordpress.com/go/website-building/what-are-wordpress-plugins-and-themes-a-beginners-guide/"
					background="studio-celadon-60"
				/>
				<LinkCard
					label={ translate( 'Customization', {
						comment: 'Wordpress.com Go article (https://wordpress.com/go/) category.',
						textOnly: true,
					} ) }
					title={ translate( 'How to Choose WordPress Plugins for Your Website (7 Tips)', {
						comment: 'Wordpress.com Go article title (https://wordpress.com/go/)',
						textOnly: true,
					} ) }
					cta={ translate( 'Read More' ) }
					url="https://wordpress.com/go/customization/how-to-choose-wordpress-plugins-for-your-website-7-tips/"
					background="studio-purple-80"
				/>
				<LinkCard
					label={ translate( 'SEO', {
						comment: 'Wordpress.com Go article (https://wordpress.com/go/) category.',
						textOnly: true,
					} ) }
					title={ translate( 'Do You Need to Use SEO Plugins on Your WordPress.com Site?', {
						comment: 'Wordpress.com Go article title (https://wordpress.com/go/)',
						textOnly: true,
					} ) }
					cta={ translate( 'Read More' ) }
					url="https://wordpress.com/go/tips/do-you-need-to-use-seo-plugins-on-your-wordpress-com-site/"
					background="studio-wordpress-blue-80"
				/>
			</ArticleLinksContainer>
		</Section>
	);
};

export default EducationFooter;
