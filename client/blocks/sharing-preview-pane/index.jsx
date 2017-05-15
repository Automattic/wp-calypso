/**
 * External dependencies
 */
import React, { PureComponent, PropTypes } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { get, find } from 'lodash';

/**
 * Internal dependencies
 */
import { getPostImage } from './utils';
import FacebookSharePreview from 'components/share/facebook-share-preview';
import TwitterSharePreview from 'components/share/twitter-share-preview';
import VerticalMenu from 'components/vertical-menu';
import { SocialItem } from 'components/vertical-menu/items';
import { getSitePost } from 'state/posts/selectors';
import { getSeoTitle } from 'state/sites/selectors';
import { getSite } from 'state/sites/selectors';
import { getSiteUserConnections } from 'state/sharing/publicize/selectors';
import { getCurrentUserId } from 'state/current-user/selectors';

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
	};

	static defaultProps = {
		services: [ 'facebook', 'twitter' ]
	};

	state = {
		selectedService: 'facebook'
	};

	selectPreview = ( selectedService ) => {
		this.setState( { selectedService } );
	};

	renderPreview() {
		const { post, message, connections } = this.props;
		const { selectedService } = this.state;
		const connection = find( connections, { service: selectedService } );
		if ( ! connection ) {
			return null;
		}

		const articleUrl = get( post, 'URL', '' );
		const imageUrl = getPostImage( post );
		const {
			external_name: externalName,
			external_profile_url: externalProfileURL,
			external_profile_picture: externalProfilePicture,
			external_display: externalDisplay,
		} = connection;

		const previewProps = {
			articleUrl,
			externalName,
			externalProfileURL,
			externalProfilePicture,
			message,
			imageUrl,
		};

		switch ( selectedService ) {
			case 'facebook':
				return <FacebookSharePreview { ...previewProps } />;
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
					<VerticalMenu onClick={ this.selectPreview }>
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

	return {
		site,
		post,
		seoTitle,
		connections,
	};
};

export default connect( mapStateToProps )( localize( SharingPreviewPane ) );
