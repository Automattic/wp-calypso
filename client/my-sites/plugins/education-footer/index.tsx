import { useLocalizeUrl } from '@automattic/i18n-utils';
import styled from '@emotion/styled';
import { useI18n } from '@wordpress/react-i18n';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import FeatureItem from 'calypso/components/feature-item';
import LinkCard from 'calypso/components/link-card';
import Section from 'calypso/components/section';
import { preventWidows } from 'calypso/lib/formatting';
import { recordTracksEvent } from 'calypso/state/analytics/actions/record';

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

const EducationFooterContainer = styled.div`
	margin-top: 48px;
`;

const EducationFooter = () => {
	const { __ } = useI18n();
	const localizeUrl = useLocalizeUrl();
	const dispatch = useDispatch();

	const onClickLinkCard = useCallback(
		( content_type: string ) => {
			dispatch(
				recordTracksEvent( 'calypso_plugins_educational_content_click', { content_type } )
			);
		},
		[ dispatch ]
	);

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
		</EducationFooterContainer>
	);
};

export default EducationFooter;
