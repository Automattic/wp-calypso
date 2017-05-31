/**
 * External dependencies
 */
import React, { PureComponent, PropTypes } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import {
	getPostShareScheduledActions,
	getPostSharePublishedActions,
} from 'state/selectors';
import QuerySharePostActions from 'components/data/query-share-post-actions/index.jsx';
import CompactCard from 'components/card/compact';
import SocialLogo from 'social-logos';
import EllipsisMenu from 'components/ellipsis-menu';
import PopoverMenuItem from 'components/popover/menu-item';
import {
	SCHEDULED,
	PUBLISHED,
} from './constants';
import SectionNav from 'components/section-nav';
import NavTabs from 'components/section-nav/tabs';
import NavItem from 'components/section-nav/item';
import { isEnabled } from 'config';
import Dialog from 'components/dialog';
import { deletePostShareAction } from 'state/sharing/publicize/publicize-actions/actions';

class PublicizeActionsList extends PureComponent {
	static propTypes = {
		siteId: PropTypes.number,
		postId: PropTypes.number,
		scheduledActions: PropTypes.array,
		publishedActions: PropTypes.array,
	};

	state = {
		selectedShareTab: SCHEDULED,
		showDeleteDialog: false,
		selectedScheduledShareId: null
	};

	setFooterSection = selectedShareTab => () => this.setState( { selectedShareTab } );

	renderFooterSectionItem( {
		ID: actionId,
		connectionName,
		message,
		shareDate,
		service,
	}, index ) {
		return (
			<CompactCard className="post-share__footer-items" key={ index }>
				<div className="post-share__footer-item">
					<div className="post-share__handle">
						<SocialLogo icon={ service === 'google_plus' ? 'google-plus' : service } />
						<span className="post-share__handle-value">
							{ connectionName }
						</span>
					</div>
					<div className="post-share__timestamp">
						<Gridicon icon="time" size={ 18 } />
						<span className="post-share__timestamp-value">
							{ shareDate }
						</span>
					</div>
					<div className="post-share__message">
						{ message }
					</div>
				</div>
				{ this.renderElipsisMenu( actionId ) }
			</CompactCard>
		);
	}

	renderElipsisMenu( publicizeActionId ) {
		const actions = [];
		const { translate } = this.props;

		if ( isEnabled( 'publicize-preview' ) ) {
			actions.push(
				<PopoverMenuItem key="1" icon="visible">
					{ translate( 'Preview' ) }
				</PopoverMenuItem>
			);
		}

		if ( this.state.selectedShareTab === SCHEDULED ) {
			actions.push(
				<PopoverMenuItem
					onClick={ this.deleteScheduledAction( publicizeActionId ) }
					key="2"
					icon="trash"
				>
					{ translate( 'Trash' ) }
				</PopoverMenuItem>
			);
		}

		if ( actions.length === 0 ) {
			return <div />;
		}
		return ( <EllipsisMenu>
			{ actions }
		</EllipsisMenu> );
	}

	deleteScheduledAction( actionId ) {
		return () => {
			this.setState( {
				showDeleteDialog: true,
				selectedScheduledShareId: actionId
			} );
		};
	}

	closeDeleteDialog = ( dialogAction ) => {
		if ( dialogAction === 'delete' ) {
			const {
				siteId,
				postId
			} = this.props;

			this.props.deletePostShareAction( siteId, postId, this.state.selectedScheduledShareId );
		}

		this.setState( { showDeleteDialog: false } );
	};

	renderActionsList = ( actions ) => (
			<div>
				{ actions.map( ( item, index ) => this.renderFooterSectionItem( item, index ) ) }
			</div>
		);

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

	render() {
		const {
			postId,
			siteId,
			scheduledActions,
			publishedActions,
		} = this.props;

		return (
			<div>
				<SectionNav className="post-share__footer-nav" selectedText={ 'some text' }>
					<NavTabs label="Status" selectedText="Published">
						<NavItem
							selected={ this.state.selectedShareTab === SCHEDULED }
							count={ this.props.scheduledActions.length }
							onClick={ this.setFooterSection( SCHEDULED ) }
						>
							Scheduled
						</NavItem>
						<NavItem
							selected={ this.state.selectedShareTab === PUBLISHED }
							count={ this.props.publishedActions.length }
							onClick={ this.setFooterSection( PUBLISHED ) }
						>
							Published
						</NavItem>
					</NavTabs>
				</SectionNav>
				<div className="post-share__actions-list">
					<QuerySharePostActions siteId={ siteId } postId={ postId } status={ SCHEDULED } />
					<QuerySharePostActions siteId={ siteId } postId={ postId } status={ PUBLISHED } />
					{ this.state.selectedShareTab === SCHEDULED &&
						<div className="post-share__scheduled-list">
							{ this.renderActionsList( scheduledActions ) }
						</div>
					}
					{ this.state.selectedShareTab === PUBLISHED &&
						<div className="post-share__published-list">
							{ this.renderActionsList( publishedActions ) }
						</div>
					}
				</div>

				{ this.renderDeleteDialog() }
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
	{ deletePostShareAction },
)( localize( PublicizeActionsList ) );
