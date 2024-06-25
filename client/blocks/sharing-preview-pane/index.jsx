import {
	FEATURE_SOCIAL_INSTAGRAM_CONNECTION,
	FEATURE_SOCIAL_MASTODON_CONNECTION,
	FEATURE_SOCIAL_NEXTDOOR_CONNECTION,
	FEATURE_SOCIAL_THREADS_CONNECTION,
} from '@automattic/calypso-products';
import { localize } from 'i18n-calypso';
import { get, find, map } from 'lodash';
import PropTypes from 'prop-types';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import FacebookSharePreview from 'calypso/components/share/facebook-share-preview';
import LinkedinSharePreview from 'calypso/components/share/linkedin-share-preview';
import MastodonSharePreview from 'calypso/components/share/mastodon-share-preview';
import NextdoorSharePreview from 'calypso/components/share/nextdoor-share-preview';
import TumblrSharePreview from 'calypso/components/share/tumblr-share-preview';
import TwitterSharePreview from 'calypso/components/share/twitter-share-preview';
import VerticalMenu from 'calypso/components/vertical-menu';
import { SocialItem } from 'calypso/components/vertical-menu/items';
import { decodeEntities } from 'calypso/lib/formatting';
import { getCurrentUserId } from 'calypso/state/current-user/selectors';
import { getSitePost } from 'calypso/state/posts/selectors';
import getSiteIconUrl from 'calypso/state/selectors/get-site-icon-url';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { getSiteUserConnections } from 'calypso/state/sharing/publicize/selectors';
import { getSeoTitle, getSite, getSiteSlug } from 'calypso/state/sites/selectors';
import InstagramSharePreview from '../../components/share/instagram-share-preview';
import ThreadsSharePreview from '../../components/share/threads-share-preview';
import {
	getPostImage,
	getExcerptForPost,
	getSummaryForPost,
	getPostCustomImage,
	getSigImageUrl,
	getPostCustomMedia,
} from './utils';

import './style.scss';

const defaultServices = [
	'facebook',
	'instagram-business',
	'x',
	'linkedin',
	'tumblr',
	'mastodon',
	'nextdoor',
	'threads',
];

class SharingPreviewPane extends PureComponent {
	static propTypes = {
		siteId: PropTypes.number,
		postId: PropTypes.number,
		services: PropTypes.array,
		message: PropTypes.string,
		// connected properties
		site: PropTypes.object,
		post: PropTypes.object,
		seoTitle: PropTypes.string,
		selectedService: PropTypes.string,
		disabledServices: PropTypes.array,
	};

	static defaultProps = {
		services: defaultServices,
	};

	constructor( props ) {
		super( props );

		const connectedServices = map( props.connections, 'service' );
		const firstConnectedService = find( this.getAvailableServices(), ( service ) => {
			return find( connectedServices, ( connectedService ) => service === connectedService );
		} );
		const selectedService = props.selectedService || firstConnectedService;
		this.state = { selectedService };
	}

	getAvailableServices() {
		const { services, disabledServices } = this.props;

		return services.filter( ( service ) => ! disabledServices.includes( service ) );
	}

	selectPreview = ( selectedService ) => {
		this.setState( { selectedService } );
	};

	renderPreview() {
		const { post, site, message, connections, translate, seoTitle, siteIcon, siteName } =
			this.props;
		const { selectedService } = this.state;

		if ( ! selectedService ) {
			return null;
		}

		const articleUrl = get( post, 'URL', '' );
		const articleTitle = get( post, 'title', '' );
		const articleContent = getExcerptForPost( post );
		const articleSummary = getSummaryForPost( post, translate );
		const siteDomain = get( site, 'domain', '' );
		const imageUrl = getSigImageUrl( post ) || getPostCustomImage( post ) || getPostImage( post );
		const media = getPostCustomMedia( post );

		const connection = find( connections, { service: selectedService } ) ?? {};

		/**
		 * Props to pass to the preview component. Will be populated with the connection
		 * specific data if the selected service is connected.
		 * @type {Object}
		 */
		const previewProps = {
			articleUrl,
			articleTitle,
			articleContent,
			articleSummary,
			message,
			imageUrl,
			seoTitle,
			siteDomain,
			siteIcon,
			siteName,
			media,
			hidePostPreview: ! connection.ID,
			externalDisplay: connection.external_display,
			externalName: connection.external_name,
			externalProfileURL: connection.external_profile_URL,
			externalProfilePicture: connection.external_profile_picture,
		};

		switch ( selectedService ) {
			case 'facebook':
				return (
					<FacebookSharePreview
						{ ...previewProps }
						articleExcerpt={ post.excerpt }
						articleContent={ post.content }
					/>
				);
			case 'instagram-business':
				return <InstagramSharePreview { ...previewProps } />;
			case 'tumblr':
				return (
					<TumblrSharePreview
						{ ...previewProps }
						articleContent={ post.content }
						externalProfileURL={ connection?.external_profile_URL }
					/>
				);
			case 'linkedin':
				return <LinkedinSharePreview { ...previewProps } />;
			case 'x':
				return <TwitterSharePreview { ...previewProps } />;
			case 'mastodon':
				return (
					<MastodonSharePreview
						{ ...previewProps }
						articleExcerpt={ post.excerpt }
						articleContent={ post.content }
					/>
				);
			case 'nextdoor':
				return (
					<NextdoorSharePreview
						{ ...previewProps }
						articleExcerpt={ post.excerpt }
						articleContent={ post.content }
					/>
				);
			case 'threads':
				return (
					<ThreadsSharePreview
						{ ...previewProps }
						articleExcerpt={ post.excerpt }
						articleContent={ post.content }
					/>
				);
			default:
				return null;
		}
	}

	render() {
		const { translate } = this.props;
		const services = this.getAvailableServices();
		const initialMenuItemIndex = services.indexOf( this.state.selectedService );

		return (
			<div className="sharing-preview-pane">
				<div className="sharing-preview-pane__sidebar">
					<div className="sharing-preview-pane__explanation">
						<h1 className="sharing-preview-pane__title">{ translate( 'Social Previews' ) }</h1>
						<p className="sharing-preview-pane__description">
							{ translate(
								'This is how your post will appear when people view or share it on any of the networks below'
							) }
						</p>
					</div>
					<VerticalMenu onClick={ this.selectPreview } initialItemIndex={ initialMenuItemIndex }>
						{ services.map( ( service ) => (
							<SocialItem key={ service } service={ service } />
						) ) }
					</VerticalMenu>
				</div>
				<div className="sharing-preview-pane__preview-area">
					<div className="sharing-preview-pane__preview">{ this.renderPreview() }</div>
				</div>
			</div>
		);
	}
}

const mapStateToProps = ( state, ownProps ) => {
	const { siteId, postId } = ownProps;
	const site = getSite( state, siteId );
	const post = getSitePost( state, siteId, postId );
	const seoTitle = decodeEntities( getSeoTitle( state, 'posts', { site, post } ) );
	const currentUserId = getCurrentUserId( state );
	const connections = getSiteUserConnections( state, siteId, currentUserId );
	const siteSlug = getSiteSlug( state, siteId );
	const siteIcon = getSiteIconUrl( state, siteId );

	const disabledServices = [];

	if ( ! siteHasFeature( state, siteId, FEATURE_SOCIAL_INSTAGRAM_CONNECTION ) ) {
		disabledServices.push( 'instagram-business' );
	}

	if ( ! siteHasFeature( state, siteId, FEATURE_SOCIAL_NEXTDOOR_CONNECTION ) ) {
		disabledServices.push( 'nextdoor' );
	}

	if ( ! siteHasFeature( state, siteId, FEATURE_SOCIAL_THREADS_CONNECTION ) ) {
		disabledServices.push( 'threads' );
	}

	if ( ! siteHasFeature( state, siteId, FEATURE_SOCIAL_MASTODON_CONNECTION ) ) {
		disabledServices.push( 'mastodon' );
	}

	return {
		site,
		post,
		seoTitle,
		connections,
		siteSlug,
		siteIcon,
		siteName: site.name,
		disabledServices,
	};
};

export default connect( mapStateToProps )( localize( SharingPreviewPane ) );
