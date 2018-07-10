/**
 * External Dependencies
 */
import { get } from 'lodash';

/**
 * WordPress Dependencies
 */
import { PanelBody, Button, ClipboardButton } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { Component, Fragment } from '@wordpress/element';
import { withSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import PostScheduleLabel from '../post-schedule/label';

class PostPublishPanelPostpublish extends Component {
	constructor() {
		super( ...arguments );
		this.state = {
			showCopyConfirmation: false,
		};
		this.onCopy = this.onCopy.bind( this );
		this.onSelectInput = this.onSelectInput.bind( this );
	}

	componentWillUnmount() {
		clearTimeout( this.dismissCopyConfirmation );
	}

	onCopy() {
		this.setState( {
			showCopyConfirmation: true,
		} );

		clearTimeout( this.dismissCopyConfirmation );
		this.dismissCopyConfirmation = setTimeout( () => {
			this.setState( {
				showCopyConfirmation: false,
			} );
		}, 4000 );
	}

	onSelectInput( event ) {
		event.target.select();
	}

	render() {
		const { children, isScheduled, post, postType } = this.props;
		const viewPostLabel = get( postType, [ 'labels', 'view_item' ] );

		const postPublishNonLinkHeader = isScheduled ?
			<Fragment>{ __( 'is now scheduled. It will go live on' ) } <PostScheduleLabel />.</Fragment> :
			__( 'is now live.' );
		const postPublishBodyText = isScheduled ?
			__( 'The post address will be:' ) :
			__( 'What\'s next?' );

		return (
			<div className="post-publish-panel__postpublish">
				<PanelBody className="post-publish-panel__postpublish-header">
					<a href={ post.link }>{ post.title || __( '(no title)' ) }</a> { postPublishNonLinkHeader }
				</PanelBody>
				<PanelBody>
					<div><strong>{ postPublishBodyText }</strong></div>
					<input
						className="post-publish-panel__postpublish-link-input"
						readOnly
						value={ post.link }
						onFocus={ this.onSelectInput }
						type="text"
					/>
					<div className="post-publish-panel__postpublish-buttons">
						{ ! isScheduled && (
							<Button isDefault href={ post.link }>
								{ viewPostLabel }
							</Button>
						) }

						<ClipboardButton isDefault text={ post.link } onCopy={ this.onCopy }>
							{ this.state.showCopyConfirmation ? __( 'Copied!' ) : __( 'Copy Link' ) }
						</ClipboardButton>
					</div>
				</PanelBody>
				{ children }
			</div>
		);
	}
}

export default withSelect( ( select ) => {
	const { getEditedPostAttribute, getCurrentPost, isCurrentPostScheduled } = select( 'core/editor' );
	const { getPostType } = select( 'core' );

	return {
		post: getCurrentPost(),
		postType: getPostType( getEditedPostAttribute( 'type' ) ),
		isScheduled: isCurrentPostScheduled(),
	};
} )( PostPublishPanelPostpublish );
