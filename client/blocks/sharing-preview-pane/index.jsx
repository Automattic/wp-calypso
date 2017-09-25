/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import { get, find } from 'lodash';
import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { getPostImage, getExcerptForPost } from './utils';
import Notice from 'components/notice';
import NoticeAction from 'components/notice/notice-action';
import FacebookSharePreview from 'components/share/facebook-share-preview';
import GooglePlusSharePreview from 'components/share/google-plus-share-preview';
import LinkedinSharePreview from 'components/share/linkedin-share-preview';
import TumblrSharePreview from 'components/share/tumblr-share-preview';
import TwitterSharePreview from 'components/share/twitter-share-preview';
import VerticalMenu from 'components/vertical-menu';
import { SocialItem } from 'components/vertical-menu/items';
import { getCurrentUserId } from 'state/current-user/selectors';
import { getSitePost } from 'state/posts/selectors';
import { getSiteUserConnections } from 'state/sharing/publicize/selectors';
import { getSeoTitle, getSiteSlug } from 'state/sites/selectors';
import { getSite } from 'state/sites/selectors';

const serviceNames = {
	facebook: 'Facebook',
	twitter: 'Twitter',
	google_plus: 'Google Plus',
	linkedin: 'LinkedIn',
	tumblr: 'Tumblr'
};

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
	};

	static defaultProps = {
		services: Object.keys( serviceNames )
	};

	constructor( props ) {
		super( props );
		this.state = {
			selectedService: props.selectedService || props.services[ 0 ]
		};
	}

	selectPreview = ( selectedService ) => {
		this.setState( { selectedService } );
	};

	renderPreview() {
		const { post, site, message, connections, translate, siteSlug } = this.props;
		const { selectedService } = this.state;
		const connection = find( connections, { service: selectedService } );
		if ( ! connection ) {
			return <Notice
				text={ translate( 'Connect to %s to see the preview', { args: serviceNames[ selectedService ] } ) }
				status="is-info"
				showDismiss={ false }
			>
				<NoticeAction href={ '/sharing/' + siteSlug } >{ translate( 'Settings' ) }</NoticeAction>
			</Notice>;
		}

		const articleUrl = get( post, 'URL', '' );
		const articleTitle = get( post, 'title', '' );
		const articleContent = getExcerptForPost( post );
		const siteDomain = get( site, 'domain', '' );
		const imageUrl = getPostImage( post );
		const {
			external_name: externalName,
			external_profile_url: externalProfileURL,
			external_profile_picture: externalProfilePicture,
			external_display: externalDisplay,
		} = connection;

		const previewProps = {
			articleUrl,
			articleTitle,
			articleContent,
			externalDisplay,
			externalName,
			externalProfileURL,
			externalProfilePicture,
			message,
			imageUrl,
			siteDomain,
		};

		switch ( selectedService ) {
			case 'facebook':
				return <FacebookSharePreview { ...previewProps } />;
			case 'google_plus':
				return <GooglePlusSharePreview { ...previewProps } />;
			case 'tumblr':
				return <TumblrSharePreview { ...previewProps } />;
			case 'linkedin':
				return <LinkedinSharePreview { ...previewProps } />;
			case 'twitter':
				return <TwitterSharePreview
					{ ...previewProps }
					externalDisplay={ externalDisplay } />;
			default:
				return null;
		}
	}

	render() {
		const { translate, services } = this.props;
		const initialMenuItemIndex = services.indexOf( this.state.selectedService );

		return (
			<div className="sharing-preview-pane">
				<div className="sharing-preview-pane__sidebar">
					<div className="sharing-preview-pane__explanation">
						<h1 className="sharing-preview-pane__title">
							{ translate( 'Social Previews' ) }
						</h1>
						<p className="sharing-preview-pane__description">
							{ translate(
								'This is how your post will appear ' +
								'when people view or share it on any of ' +
								'the networks below' ) }
						</p>
					</div>
					<VerticalMenu onClick={ this.selectPreview } initialItemIndex={ initialMenuItemIndex } >
						{ services.map( service => <SocialItem { ...{ key: service, service } } /> ) }
					</VerticalMenu>
				</div>
				<div className="sharing-preview-pane__preview-area">
					<div className="sharing-preview-pane__preview">
						{ this.renderPreview() }
					</div>
				</div>
			</div>
		);
	}
}

const mapStateToProps = ( state, ownProps ) => {
	const { siteId, postId } = ownProps;
	const site = getSite( state, siteId );
	const post = getSitePost( state, siteId, postId );
	const seoTitle = getSeoTitle( state, 'posts', { site, post } );
	const currentUserId = getCurrentUserId( state );
	const connections = getSiteUserConnections( state, siteId, currentUserId );
	const siteSlug = getSiteSlug( state, siteId );

	return {
		site,
		post,
		seoTitle,
		connections,
		siteSlug,
	};
};

export default connect( mapStateToProps )( localize( SharingPreviewPane ) );
