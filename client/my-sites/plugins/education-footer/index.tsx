import { useLocalizeUrl } from '@automattic/i18n-utils';
import styled from '@emotion/styled';
import { useI18n } from '@wordpress/react-i18n';
import LinkCard from 'calypso/components/link-card';
import Section from 'calypso/components/section';

const FeatureItemContainer = styled.div`
	margin-top: calc( 64px - 25px ); // adds the margin needed for 64px
`;

const FeatureItemHeader = styled.div`
	margin-bottom: 16px;
	font-size: var( --scss-font-body );
	font-weight: 500;
	line-height: 24px;
	color: var( --color-text-inverted );
`;

const FeatureItemContent = styled.p`
	font-size: var( --scss-font-body-small );
	font-weight: 400;
	line-height: 22px;
	color: var( --color-neutral-20 );
`;

const FeatureItem = ( props ) => {
	const { header, children } = props;

	return (
		<FeatureItemContainer>
			<FeatureItemHeader>{ header }</FeatureItemHeader>
			<FeatureItemContent>{ children }</FeatureItemContent>
		</FeatureItemContainer>
	);
};

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
			<Section header={ __( 'WordPress.com is the best place to get your plugins.' ) } dark>
				<ThreeColumnContainer>
					<FeatureItem header="Fully Managed">
						Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin nisl urna, lobortis eu
						fermentum sed, ultricies ac dui.
					</FeatureItem>
					<FeatureItem header="One Click Checkout">
						Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin nisl urna, lobortis eu
						fermentum sed, ultricies ac dui.
					</FeatureItem>
					<FeatureItem header="Quality Approved">
						Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin nisl urna, lobortis eu
						fermentum sed, ultricies ac dui.
					</FeatureItem>
				</ThreeColumnContainer>
			</Section>
		</>
	);
};

export default EducationFooter;
