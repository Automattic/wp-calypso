import { recordTracksEvent } from '@automattic/calypso-analytics';
import { useLocalizeUrl } from '@automattic/i18n-utils';
import { ExternalLink } from '@wordpress/components';
import { createHigherOrderComponent } from '@wordpress/compose';
import { addFilter } from '@wordpress/hooks';
import { __ } from '@wordpress/i18n';

const trackTagsEducationLinkClick = () =>
	recordTracksEvent( 'wpcom_block_editor_tags_education_link_click' );

const addTagsEducationLink = createHigherOrderComponent( ( PostTaxonomyType ) => {
	return ( props ) => {
		const localizeUrl = useLocalizeUrl();

		if ( props.slug !== 'post_tag' ) {
			return <PostTaxonomyType { ...props } />;
		}

		return (
			<>
				<PostTaxonomyType { ...props } />
				<ExternalLink
					href={ localizeUrl(
						'https://wordpress.com/support/posts/tags/',
						// TODO: remove tagsEducationLocale after fixing useLocalizeUrl.
						// See https://github.com/Automattic/wp-calypso/pull/55527.
						// `useLocalizeUrl` will try to get the current locale slug from the @wordpress/i18n locale data if missing `LocaleProvider`
						// However, if we have any string without translation in `default` domain, the configure block will be overwritten by empty locale data
						// so that we cannot get the correct locale from the @wordpress/i18n locale data.
						// Also, the format of current locale slug is not ISO 639 and it makes localizeUrl not work correctly.
						window.tagsEducationLocale
					) }
					onClick={ trackTagsEducationLinkClick }
				>
					{ __( 'Build your audience with tags', 'full-site-editing' ) }
				</ExternalLink>
			</>
		);
	};
}, 'addTagsEducationLink' );

addFilter(
	'editor.PostTaxonomyType',
	'full-site-editing/add-tags-education-link',
	addTagsEducationLink
);
