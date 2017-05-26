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

class PublicizeActionsList extends PureComponent {
	static propTypes = {
		siteId: PropTypes.number,
		postId: PropTypes.number,
		scheduledActions: PropTypes.array,
		publishedActions: PropTypes.array,
	};

	state = {
		selectedShareTab: SCHEDULED,
	};
	setFooterSection = selectedShareTab => () => this.setState( { selectedShareTab } );
	renderFooterSectionItem( {
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
				{ this.renderElipsisMenu() }
			</CompactCard>
		);
	}

	renderElipsisMenu() {
		const actions = [];
		const { translate } = this.props;

		if ( isEnabled( 'publicize-preview' ) ) {
			actions.push( <PopoverMenuItem icon="visible">
				{ translate( 'Preview' ) }
			</PopoverMenuItem> );
		}

		if ( this.state.selectedShareTab === SCHEDULED ) {
			actions.push( <PopoverMenuItem icon="trash">
				{ translate( 'Trash' ) }
			</PopoverMenuItem> );
		}

		if ( actions.length === 0 ) {
			return <div />;
		}
		return ( <EllipsisMenu>
			{ actions }
		</EllipsisMenu> );
	}

	renderActionsList = ( actions ) => (
		<div>
			{ actions.map( ( item, index ) => this.renderFooterSectionItem( item, index ) ) }
		</div>
	);
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
