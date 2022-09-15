import { useLocalizeUrl } from '@automattic/i18n-utils';
import { useI18n } from '@wordpress/react-i18n';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import LinkCard from 'calypso/components/link-card';
import Section from 'calypso/components/section';
import { recordTracksEvent } from 'calypso/state/analytics/actions/record';
import ThreeColumnContainer from './three-column-container';

const LinkCardSection = () => {
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
	);
};

export default LinkCardSection;
