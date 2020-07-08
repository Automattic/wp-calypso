/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import Gridicon from 'components/gridicon';

/**
 * Internal dependencies
 */
import getPostSharePublishedActions from 'state/selectors/get-post-share-published-actions';

import getPostShareScheduledActions from 'state/selectors/get-post-share-scheduled-actions';
import QuerySharePostActions from 'components/data/query-share-post-actions/index.jsx';
import SocialLogo from 'components/social-logo';
import EllipsisMenu from 'components/ellipsis-menu';
import PopoverMenuItem from 'components/popover/menu-item';
import { SCHEDULED, PUBLISHED } from './constants';
import SectionNav from 'components/section-nav';
import NavTabs from 'components/section-nav/tabs';
import NavItem from 'components/section-nav/item';
import { isEnabled } from 'config';
import { Dialog } from '@automattic/components';
import { deletePostShareAction } from 'state/sharing/publicize/publicize-actions/actions';
import { recordTracksEvent } from 'lib/analytics/tracks';
import SharingPreviewModal from './sharing-preview-modal';
import Notice from 'components/notice';
import { withLocalizedMoment } from 'components/localized-moment';

class PublicizeActionsList extends PureComponent {
	static propTypes = {
		siteId: PropTypes.number,
		postId: PropTypes.number,
		scheduledActions: PropTypes.array,
		publishedActions: PropTypes.array,
	};

	state = {
		selectedShareTab: PUBLISHED,
		showDeleteDialog: false,
		selectedScheduledShareId: null,
		showPreviewModal: false,
		previewMessage: '',
		previewService: '',
	};

	setFooterSection = ( selectedShareTab ) => () => {
		recordTracksEvent( 'calypso_publicize_action_tab_click', { tab: selectedShareTab } );
		this.setState( { selectedShareTab } );
	};

	togglePreviewModal = ( message = '', service = '' ) => () => {
		if ( this.state.showPreviewModal ) {
			return this.setState( { showPreviewModal: false } );
		}

		this.setState( {
			showPreviewModal: true,
			previewMessage: message,
			previewService: service,
		} );
	};

	renderActionItem( item, index ) {
		const { service, connectionName, date, message } = item;
		const shareDate = this.props.moment( date ).format( 'llll' );

		return (
			<div className="post-share__footer-items" key={ index }>
				<div className="post-share__footer-item">
					<div className="post-share__handle">
						<SocialLogo icon={ service === 'google_plus' ? 'google-plus' : service } />
						<span className="post-share__handle-value">{ connectionName }</span>
					</div>
					<div className="post-share__timestamp">
						<Gridicon icon="time" size={ 18 } />
						<span className="post-share__timestamp-value">{ shareDate }</span>
					</div>
					<div className="post-share__message">{ message }</div>
				</div>
				{ this.renderFooterSectionItemActions( item ) }
			</div>
		);
	}

	renderFooterSectionItemActions( item ) {
		const { ID: actionId, message, service, url } = item;

		if ( this.state.selectedShareTab === SCHEDULED ) {
			return this.renderScheduledMenu( actionId, message, service );
		}

		// PUBLISHED tab
		return (
			url && (
				<a
					className="post-share__external-url"
					href={ url }
					target="_blank"
					rel="noopener noreferrer"
				>
					<Gridicon icon="external" size={ 24 } />
				</a>
			)
		);
	}

	renderScheduledMenu( publicizeActionId, message, service ) {
		const actions = [];
		const { translate } = this.props;

		if ( isEnabled( 'publicize-preview' ) ) {
			actions.push(
				<PopoverMenuItem
					onClick={ this.togglePreviewModal( message, service ) }
					key="1"
					icon="visible"
				>
					{ translate( 'Preview' ) }
				</PopoverMenuItem>
			);
		}

		actions.push(
			<PopoverMenuItem
				onClick={ this.deleteScheduledAction( publicizeActionId ) }
				key="2"
				icon="trash"
			>
				{ translate( 'Trash' ) }
			</PopoverMenuItem>
		);

		if ( actions.length === 0 ) {
			return <div />;
		}
		return <EllipsisMenu>{ actions }</EllipsisMenu>;
	}

	deleteScheduledAction( actionId ) {
		return () => {
			this.setState( {
				showDeleteDialog: true,
				selectedScheduledShareId: actionId,
			} );
		};
	}

	closeDeleteDialog = ( dialogAction ) => {
		if ( dialogAction === 'delete' ) {
			const { siteId, postId } = this.props;
			recordTracksEvent( 'calypso_publicize_scheduled_delete' );
			this.props.deletePostShareAction( siteId, postId, this.state.selectedScheduledShareId );
		}

		this.setState( { showDeleteDialog: false } );
	};

	renderActionsList = () => {
		const { publishedActions, scheduledActions, translate } = this.props;

		if ( this.state.selectedShareTab === PUBLISHED ) {
			return (
				<div className="post-share__published-list">
					{ publishedActions.map( ( item, index ) => this.renderActionItem( item, index ) ) }
				</div>
			);
		}

		if ( scheduledActions.length === 0 ) {
			return (
				<Notice
					status="is-info"
					showDismiss={ false }
					text={ translate(
						'Did you know you can decide exactly when Publicize shares your post? You can! ' +
							'Click the calendar icon next to "Share post" to schedule your social shares.'
					) }
				/>
			);
		}

		return (
			<div className="post-share__scheduled-list">
				{ scheduledActions.map( ( item, index ) => this.renderActionItem( item, index ) ) }
			</div>
		);
	};

	renderDeleteDialog() {
		const { translate } = this.props;

		const buttons = [
			{ action: 'cancel', label: translate( 'Cancel' ) },
			{ action: 'delete', label: translate( 'Delete scheduled share' ), isPrimary: true },
		];

		return (
			<Dialog
				isVisible={ this.state.showDeleteDialog }
				buttons={ buttons }
				onClose={ this.closeDeleteDialog }
			>
				<h1>{ translate( 'Confirmation' ) }</h1>
				<p>{ translate( 'Do you want to delete the scheduled share?' ) }</p>
			</Dialog>
		);
	}

	getShareTabLabel( shareTab ) {
		const { translate } = this.props;
		return shareTab === SCHEDULED ? translate( 'Scheduled' ) : translate( 'Published' );
	}

	getShareTabCount( shareTab ) {
		return shareTab === SCHEDULED
			? this.props.scheduledActions.length
			: this.props.publishedActions.length;
	}

	renderShareTab( shareTab ) {
		return (
			<NavItem
				key={ shareTab }
				selected={ this.state.selectedShareTab === shareTab }
				count={ this.getShareTabCount( shareTab ) }
				onClick={ this.setFooterSection( shareTab ) }
			>
				{ this.getShareTabLabel( shareTab ) }
			</NavItem>
		);
	}

	render() {
		const { hasRepublicizeFeature, postId, siteId } = this.props;

		const tabs = hasRepublicizeFeature ? [ SCHEDULED, PUBLISHED ] : [ PUBLISHED ];

		return (
			<div>
				<SectionNav
					className="post-share__footer-nav"
					selectedText={ this.getShareTabLabel( this.state.selectedShareTab ) }
					selectedCount={ this.getShareTabCount( this.state.selectedShareTab ) }
				>
					<NavTabs>{ tabs.map( this.renderShareTab, this ) }</NavTabs>
				</SectionNav>
				<div className="post-share__actions-list">
					<QuerySharePostActions siteId={ siteId } postId={ postId } status={ SCHEDULED } />
					<QuerySharePostActions siteId={ siteId } postId={ postId } status={ PUBLISHED } />

					{ this.renderActionsList() }
				</div>

				{ this.renderDeleteDialog() }

				<SharingPreviewModal
					siteId={ siteId }
					postId={ postId }
					message={ this.state.previewMessage }
					selectedService={ this.state.previewService }
					isVisible={ this.state.showPreviewModal }
					onClose={ this.togglePreviewModal() }
				/>
			</div>
		);
	}
}

export default connect(
	( state, { postId, siteId } ) => {
		return {
			scheduledActions: getPostShareScheduledActions( state, siteId, postId ),
			publishedActions: getPostSharePublishedActions( state, siteId, postId ),
		};
	},
	{ deletePostShareAction }
)( localize( withLocalizedMoment( PublicizeActionsList ) ) );
