import styled from '@emotion/styled';
import LinkCardSection from './link-card-section';
import StaticInfoSection from './static-info-section';

const EducationFooterContainer = styled.div`
	margin-top: 48px;
`;

export const MarketplaceFooter = () => {
	const { __ } = useI18n();

	return (
		<Section
			header={ preventWidows( __( 'You pick the plugin. We’ll take care of the rest.' ) ) }
			dark
		>
			<ThreeColumnContainer>
				<FeatureItem header={ __( 'Fully Managed' ) }>
					{ __(
						'Premium plugins are fully managed by the team at WordPress.com. No security patches. No update nags. It just works.'
					) }
				</FeatureItem>
				<FeatureItem header={ __( 'Thousands of plugins' ) }>
					{ __(
						'From WordPress.com premium plugins to thousands more community-authored plugins, we’ve got you covered.'
					) }
				</FeatureItem>
				<FeatureItem header={ __( 'Flexible pricing' ) }>
					{ __(
						'Pay yearly and save. Or keep it flexible with monthly premium plugin pricing. It’s entirely up to you.'
					) }
				</FeatureItem>
			</ThreeColumnContainer>
		</Section>
	);
};

const EducationFooter = () => {
	return (
		<EducationFooterContainer>
			<Section
				header={ __( 'Get started with plugins' ) }
				subheader={ __( 'Our favorite how-to guides to get you started with plugins' ) }
			>
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
						onClick={ () => onClickLinkCard( 'website_building' ) }
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
						onClick={ () => onClickLinkCard( 'customization' ) }
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
						onClick={ () => onClickLinkCard( 'seo' ) }
					/>
				</ThreeColumnContainer>
			</Section>
			<MarketplaceFooter />
		</EducationFooterContainer>
	);
};

export default EducationFooter;
