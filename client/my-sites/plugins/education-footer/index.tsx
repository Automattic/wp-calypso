import { useLocalizeUrl } from '@automattic/i18n-utils';
import styled from '@emotion/styled';
import { useI18n } from '@wordpress/react-i18n';
import FeatureItem from 'calypso/components/feature-item';
import LinkCard from 'calypso/components/link-card';
import Section from 'calypso/components/section';

const ThreeColumnContainer = styled.div`
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
		<>
			<Section header={ __( 'Learn more' ) }>
				<ThreeColumnContainer>
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
				</ThreeColumnContainer>
			</Section>
			<Section header={ __( 'Upgrade your WordPress site with confidence' ) } dark>
				<ThreeColumnContainer>
					<FeatureItem header={ __( 'Fully Managed' ) }>
						{ __(
							'Premium plugins are fully managed by the team at WordPress.com. No security patches. No update nags. It just works.'
						) }
					</FeatureItem>
					<FeatureItem header={ __( 'Thousands of plugins' ) }>
						{ __(
							'Along with our hand curated collection of premium plugins, you also have thousands of community developed plugins at your disposal.'
						) }
					</FeatureItem>
					<FeatureItem header={ __( 'Flexible pricing' ) }>
						{ __(
							'WordPress.com offers monthly and annual premium plugin pricing for extra flexibility.'
						) }
					</FeatureItem>
				</ThreeColumnContainer>
			</Section>
		</>
	);
};

export default EducationFooter;
