import { useLocalizeUrl } from '@automattic/i18n-utils';
import { ExternalLink } from '@wordpress/components';
import { createHigherOrderComponent } from '@wordpress/compose';
import { addFilter } from '@wordpress/hooks';
import { __ } from '@wordpress/i18n';
import tracksRecordEvent from './tracking/track-record-event';

const trackTagsEducationLinkClick = () =>
	tracksRecordEvent( 'wpcom_block_editor_tags_education_link_click' );

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
					href={ localizeUrl( 'https://wordpress.com/support/posts/tags/' ) }
					onClick={ trackTagsEducationLinkClick }
				>
					{ __( 'Build your audience with tags' ) }
				</ExternalLink>
			</>
		);
	};
}, 'addTagsEducationLink' );

addFilter( 'editor.PostTaxonomyType', 'add-tags-education-link', addTagsEducationLink );
