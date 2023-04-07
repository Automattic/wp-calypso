import { FacebookPreview } from '@automattic/social-previews';
import PropTypes from 'prop-types';
import { PureComponent } from 'react';

export class FacebookSharePreview extends PureComponent {
	static propTypes = {
		articleContent: PropTypes.string,
		articleSummary: PropTypes.string,
		articleUrl: PropTypes.string,
		externalProfilePicture: PropTypes.string,
		imageUrl: PropTypes.string,
		message: PropTypes.string,
		seoTitle: PropTypes.string,
	};

	render() {
		const {
			articleContent,
			articleSummary,
			articleUrl,
			externalDisplay,
			externalProfilePicture,
			imageUrl,
			message,
			seoTitle,
		} = this.props;

		return (
			<FacebookPreview
				url={ articleUrl }
				title={ seoTitle }
				description={ articleContent }
				image={ imageUrl }
				customText={ message || articleSummary }
				user={ { displayName: externalDisplay, avatarUrl: externalProfilePicture } }
			/>
		);
	}
}

export default FacebookSharePreview;
