import { useLocalizeUrl } from '@automattic/i18n-utils';
import styled from '@emotion/styled';
import { useI18n } from '@wordpress/react-i18n';
import LinkCard from 'calypso/components/link-card';
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
	const { __ } = useI18n();
	const localizeUrl = useLocalizeUrl();

	return (
		<Section header={ __( 'Learn more' ) }>
			<ArticleLinksContainer>
				<LinkCard
					external
					label={ __( 'Website Building' ) }
					title={ __( 'What Are WordPress Plugins and Themes? (A Beginner’s Guide)' ) }
					cta={ __( 'Read More' ) }
					url={ localizeUrl(
						'https://wordpress.com/go/website-building/what-are-wordpress-plugins-and-themes-a-beginners-guide/'
					) }
					background="studio-celadon-60"
				/>
				<LinkCard
					external
					label={ __( 'Customization' ) }
					title={ __( 'How to Choose WordPress Plugins for Your Website (7 Tips)' ) }
					cta={ __( 'Read More' ) }
					url={ localizeUrl(
						'https://wordpress.com/go/customization/how-to-choose-wordpress-plugins-for-your-website-7-tips/'
					) }
					background="studio-purple-80"
				/>
				<LinkCard
					external
					label={ __( 'SEO' ) }
					title={ __( 'Do You Need to Use SEO Plugins on Your WordPress.com Site?' ) }
					cta={ __( 'Read More' ) }
					url={ localizeUrl(
						'https://wordpress.com/go/tips/do-you-need-to-use-seo-plugins-on-your-wordpress-com-site/'
					) }
					background="studio-wordpress-blue-80"
				/>
			</ArticleLinksContainer>
		</Section>
	);
};

export default EducationFooter;
