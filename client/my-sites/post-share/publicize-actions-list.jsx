/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
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

class PublicizeActionsList extends Component {
	static propTypes = {
		section: PropTypes.string,
		siteId: PropTypes.number,
		postId: PropTypes.number,
	};

	static defaultProps = {
		section: SCHEDULED,
	};

	renderFooterSectionItem( {
		externalName,
		message,
		shareDate,
		service,
	}, index ) {
		const { translate } = this.props;
		return (
			<CompactCard className="post-share__footer-items" key={ index }>
				<div className="post-share__footer-item">
					<div className="post-share__handle">
						<SocialLogo icon={ service === 'google_plus' ? 'google-plus' : service } />
						<span className="post-share__handle-value">
							{ service === 'twitter' ? `@${ externalName }` : externalName }
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
				<EllipsisMenu>
					<PopoverMenuItem icon="visible">
						{ translate( 'Preview' ) }
					</PopoverMenuItem>
					<PopoverMenuItem icon="pencil">
						{ translate( 'Edit' ) }
					</PopoverMenuItem>
					<PopoverMenuItem icon="trash">
						{ translate( 'Trash' ) }
					</PopoverMenuItem>
				</EllipsisMenu>
			</CompactCard>
		);
	}

	renderScheduledList() {
		if ( this.props.section !== SCHEDULED ) {
			return null;
		}

		const {
			postId,
			scheduledActions,
			siteId,
		} = this.props;

		return (
			<div>
				<QuerySharePostActions siteId={ siteId } postId={ postId } status="scheduled" />
				{
					scheduledActions.map( ( item, index ) => this.renderFooterSectionItem( item, index ) )
				}
			</div>
		);
	}

	renderPublishedList() {
		if ( this.props.section !== PUBLISHED ) {
			return null;
		}

		// TBI
		return 'published';
	}

	render() {
		return (
			<div className="post-share__actions-list">
				<div className="post-share__scheduled-list">
					{ this.renderScheduledList() }
				</div>

				<div className="post-share__published-list">
					{ this.renderPublishedList() }
				</div>
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
)( localize( PublicizeActionsList ) );
