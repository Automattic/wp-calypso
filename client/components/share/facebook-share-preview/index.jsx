import { FacebookPreviews, TYPE_ARTICLE } from '@automattic/social-previews';
import PropTypes from 'prop-types';
import { PureComponent } from 'react';
import striptags from 'striptags';
import { decodeEntities } from 'calypso/lib/formatting';

export class FacebookSharePreview extends PureComponent {
	static propTypes = {
		articleExcerpt: PropTypes.string,
		articleContent: PropTypes.string,
		articleUrl: PropTypes.string,
		externalProfilePicture: PropTypes.string,
		imageUrl: PropTypes.string,
		customImage: PropTypes.string,
		message: PropTypes.string,
		seoTitle: PropTypes.string,
		hidePostPreview: PropTypes.bool,
	};

	render() {
		const {
			articleExcerpt,
			articleContent,
			articleUrl,
			externalDisplay,
			externalProfilePicture,
			imageUrl,
			message,
			media,
			seoTitle,
			hidePostPreview,
		} = this.props;

		// The post object in the state has a default excerpt, which is the first words of the
		// content and an ellipsis. To match Facebook's preview behaviour we need to know
		// when an excerpt has been actually set by the user. The original excerpt below
		// is empty if the user hasn't set a custom excerpt.
		const rawContent = striptags( articleContent ).trim();
		const rawExcerpt = striptags( articleExcerpt.replace( '[&hellip;]', '' ) ).trim();
		const originalExcerpt = rawContent.indexOf( rawExcerpt ) === 0 ? '' : articleExcerpt;

		return (
			<FacebookPreviews
				url={ articleUrl }
				title={ decodeEntities( seoTitle ) }
				description={ decodeEntities( originalExcerpt || articleContent ) }
				image={ imageUrl }
				customText={ decodeEntities( message || originalExcerpt || articleContent || seoTitle ) }
				media={ media }
				user={ { displayName: externalDisplay, avatarUrl: externalProfilePicture } }
				type={ TYPE_ARTICLE }
				hidePostPreview={ hidePostPreview }
			/>
		);
	}
}

export default FacebookSharePreview;
