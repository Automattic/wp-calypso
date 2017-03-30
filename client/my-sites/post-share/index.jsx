/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';
import { get, includes, map } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import QueryPostTypes from 'components/data/query-post-types';
import QueryPublicizeConnections from 'components/data/query-publicize-connections';
import Button from 'components/button';
import ButtonGroup from 'components/button-group';
import { isPublicizeEnabled } from 'state/selectors';
import {
	getSiteSlug,
	getSitePlanSlug,
} from 'state/sites/selectors';
import { getCurrentUserId, getCurrentUserCurrencyCode } from 'state/current-user/selectors';
import {
	getSiteUserConnections,
	hasFetchedConnections as siteHasFetchedConnections,
} from 'state/sharing/publicize/selectors';

import { fetchConnections as requestConnections, sharePost, dismissShareConfirmation } from 'state/sharing/publicize/actions';
import { isRequestingSharePost, sharePostFailure, sharePostSuccessMessage } from 'state/sharing/publicize/selectors';
import PostMetadata from 'lib/post-metadata';
import PublicizeMessage from 'post-editor/editor-sharing/publicize-message';
import Notice from 'components/notice';
import {
	hasFeature,
	getSitePlanRawPrice,
	getPlanDiscountedRawPrice,
} from 'state/sites/plans/selectors';
import {
	FEATURE_REPUBLICIZE,
	FEATURE_REPUBLICIZE_SCHEDULING,
	PLAN_BUSINESS,
} from 'lib/plans/constants';

import SectionNav from 'components/section-nav';
import NavTabs from 'components/section-nav/tabs';
import NavItem from 'components/section-nav/item';
import Banner from 'components/banner';
import ConnectionsList, { NoConnectionsNotice } from './connections-list';
import ActionsList from './publicize-actions-list';
import SharingPreviewModal from './sharing-preview-modal';
import CalendarButton from 'blocks/calendar-button';
import formatCurrency from 'lib/format-currency';
import {
	SCHEDULED,
	PUBLISHED,
} from './constants';

class PostShare extends Component {
	static propTypes = {
		connections: PropTypes.array,
		isPublicizeEnabled: PropTypes.bool,
		planSlug: PropTypes.string,
		post: PropTypes.object,
		postId: PropTypes.number,
		requestConnections: PropTypes.func,
		site: PropTypes.object,
		siteId: PropTypes.number,
		siteSlug: PropTypes.string,
	};

	static defaultProps = {
		connections: [],
	};

	state = {
		selectedShareTab: SCHEDULED,
		message: PostMetadata.publicizeMessage( this.props.post ) || this.props.post.title,
		skipped: PostMetadata.publicizeSkipped( this.props.post ) || [],
		showSharingPreview: false,
	};

	setFooterSection = selectedShareTab => () => this.setState( { selectedShareTab } );

	hasConnections() {
		return !! get( this.props, 'connections.length' );
	}

	toggleConnection = id => {
		const skipped = this.state.skipped.slice();
		const index = skipped.indexOf( id );
		if ( index !== -1 ) {
			skipped.splice( index, 1 );
		} else {
			skipped.push( id );
		}

		this.setState( { skipped } );
	};

	skipConnection( { keyring_connection_ID } ) {
		return this.state.skipped.indexOf( keyring_connection_ID ) === -1;
	}

	isConnectionActive = connection => connection.status !== 'broken' && this.skipConnection( connection );

	setMessage = message => this.setState( { message } );

	dismiss = () => {
		this.props.dismissShareConfirmation( this.props.siteId, this.props.post.ID );
	};

	sharePost = () => {
		this.props.sharePost( this.props.siteId, this.props.post.ID, this.state.skipped, this.state.message );
	};

	isButtonDisabled() {
		if ( this.props.requesting ) {
			return true;
		}

		return this.props.connections.filter( this.isConnectionActive ).length < 1;
	}

	previewSharingPost = () => {
	}
	toggleSharingPreview = () => {
		const showSharingPreview = ! this.state.showSharingPreview;
		this.setState( { showSharingPreview } );
	}

	renderMessage() {
		if ( ! this.hasConnections() ) {
			return;
		}

		const targeted = this.hasConnections() ? this.props.connections.filter( this.isConnectionActive ) : [];
		const requireCount = includes( map( targeted, 'service' ), 'twitter' );
		const acceptableLength = ( requireCount ) ? 140 - 23 - 23 : null;

		return (
			<PublicizeMessage
				message={ this.state.message }
				preview={ this.props.post.title }
				requireCount={ requireCount }
				onChange={ this.setMessage }
				acceptableLength={ acceptableLength } />
		);
	}

	renderShareButton() {
		const {
			hasRepublicizeSchedulingFeature,
			siteId,
			translate,
		} = this.props;

		const shareButton = <Button
			className="post-share__button"
			primary
			onClick={ this.sharePost }
			disabled={ this.isButtonDisabled() }
		>
			{ translate( 'Share post' ) }
		</Button>;

		if ( ! hasRepublicizeSchedulingFeature ) {
			return shareButton;
		}

		return (
			<div className="post-share__button-actions">
				<Button onClick={ this.toggleSharingPreview }>
					{ translate( 'Preview' ) }
				</Button>

				<ButtonGroup className="post-share__share-combo">
					{ shareButton }

					<CalendarButton
						primary
						className="post-share__schedule-button"
						disabled={ this.isButtonDisabled() }
						title={ translate( 'Set date and time' ) }
						tabIndex={ 3 }
						siteId={ siteId }
						popoverPosition="bottom left" />
				</ButtonGroup>
			</div>
		);
	}

	renderUpgradeToGetPublicizeNudge() {
		const { translate } = this.props;
		return (
			<Banner
				className="post-share__upgrade-nudge"
				feature="republicize"
				title={ translate( 'Unlock the ability to re-share posts to social media' ) }
				callToAction={ translate( 'Upgrade to Premium' ) }
				description={ translate( 'Get unlimited premium themes, video uploads, monetize your site and more.' ) }
			/>
		);
	}

	renderUpgradeToGetSchedulingNudge() {
		if ( this.props.hasRepublicizeSchedulingFeature ) {
			return null;
		}

		const {
			businessDiscountedRawPrice,
			businessRawPrice,
			translate,
			userCurrency,
		} = this.props;

		return (
			<Banner
				className="post-share__footer-banner"
				callToAction={
					translate( 'Upgrade for %s', {
						args: formatCurrency( businessDiscountedRawPrice || businessRawPrice, userCurrency ),
						comment: '%s will be replaced by a formatted price, i.e $9.99'
					} )
				}
				list={ [
					translate( 'Schedule your social messages in advance.' ),
					translate( 'Remove all advertising from your site.' ),
					translate( 'Enjoy live chat support.' ),
				] }
				plan={ PLAN_BUSINESS }
				title={ translate( 'Upgrade to a Business Plan!' ) } />
		);
	}

	renderActionsSection() {
		if ( ! this.props.hasRepublicizeSchedulingFeature ) {
			return null;
		}

		const { postId, siteId, } = this.props;
		const { selectedShareTab } = this.state;

		return (
			<div className="post-share__footer">
				<SectionNav className="post-share__footer-nav" selectedText={ 'some text' }>
					<NavTabs label="Status" selectedText="Published">
						<NavItem
							selected={ selectedShareTab === SCHEDULED }
							count={ 4 }
							onClick={ this.setFooterSection( SCHEDULED ) }
						>
							Scheduled
						</NavItem>
						<NavItem
							selected={ selectedShareTab === PUBLISHED }
							count={ 2 }
							onClick={ this.setFooterSection( PUBLISHED ) }
						>
							Published
						</NavItem>
					</NavTabs>
				</SectionNav>

				<ActionsList
					section={ selectedShareTab }
					postId={ postId }
					siteId={ siteId }
				/>
			</div>
		);
	}

	renderRequestSharingNotice() {
		const {
			failure,
			requesting,
			success,
			translate,
		} = this.props;

		if ( requesting ) {
			return (
				<Notice status="is-warning" showDismiss={ false }>
						{ translate( 'Sharing…' ) }
				</Notice>
			);
		}

		if ( success ) {
			return (
				<Notice status="is-success" onDismissClick={ this.dismiss }>
					{ translate( 'Post shared. Please check your social media accounts.' ) }
				</Notice>
			);
		}

		if ( failure ) {
			return (
				<Notice status="is-error" onDismissClick={ this.dismiss }>
					{ translate( 'Something went wrong. Please don\'t be mad.' ) }
				</Notice>
			);
		}
	}

	renderConnectionsSection() {
		const { hasFetchedConnections, siteId, siteSlug, translate } = this.props;

		// enrich connections
		const connections = map( this.props.connections, connection => (
			{ ...connection, isActive: this.isConnectionActive( connection ) } )
		);

		return (
			<div className="post-share__services">
				<h5 className="post-share__services-header">
					{ translate( 'Connected services' ) }
				</h5>

				<ConnectionsList { ...{
					connections,
					hasFetchedConnections,
					siteId,
					siteSlug,
				} }
					onToggle={ this.toggleConnection }
				/>

				<Button
					href={ '/sharing/' + siteId }
					compact={ true }
					className="post-share__services-add"
				>
					{ translate( 'Add account' ) }
				</Button>
			</div>
		);
	}

	renderPrimarySection() {
		const { hasFetchedConnections, siteSlug, translate } = this.props;

		if ( ! hasFetchedConnections ) {
			return null;
		}

		if ( ! this.hasConnections() ) {
			return (
				<NoConnectionsNotice { ...{
					siteSlug,
					translate,
				} } />
			);
		}

		return (
			<div>
				<div className="post-share__main">
					<div className="post-share__form">
						{ this.renderMessage() }
						{ this.renderShareButton() }
					</div>

					{ this.renderConnectionsSection() }
				</div>

				{ this.renderUpgradeToGetSchedulingNudge() }
				{ this.renderActionsSection() }
			</div>
		);
	}

	render() {
		if ( ! this.props.isPublicizeEnabled ) {
			return null;
		}

		if ( ! this.props.hasRepublicizeFeature ) {
			return this.renderUpgradeToGetPublicizeNudge();
		}

		const {
			hasRepublicizeFeature,
			hasRepublicizeSchedulingFeature,
			postId,
			siteId,
			siteSlug,
			translate,
		} = this.props;

		if ( ! siteId || ! postId ) {
			return null;
		}

		const classes = classNames(
			'post-share__wrapper',
			{ 'has-connections': this.hasConnections() },
			{ 'has-republicize-feature': hasRepublicizeFeature },
			{ 'has-republicize-scheduling-feature': hasRepublicizeSchedulingFeature },
		);

		return (
			<div className="post-share">
				{ this.renderRequestSharingNotice() }

				<div className={ classes }>
					<QueryPostTypes siteId={ siteId } />
					<QueryPublicizeConnections siteId={ siteId } />

					<div className="post-share__head">
						<h4 className="post-share__title">
							{ translate( 'Share this post' ) }
						</h4>
						<div className="post-share__subtitle">
							{ translate(
								'Share your post on all of your connected social media accounts using ' +
								'{{a}}Publicize{{/a}}.', {
									components: {
										a: <a href={ `/sharing/${ siteSlug }` } />
									}
								}
							) }
						</div>
					</div>

					{ this.renderPrimarySection() }
				</div>
				<SharingPreviewModal
					postId={ postId }
					siteId={ siteId }
					message={ this.state.message }
					isVisible={ this.state.showSharingPreview }
					onClose={ this.toggleSharingPreview }
				/>
			</div>
		);
	}
}

export default connect(
	( state, props ) => {
		const siteId = get( props, 'site.ID' );
		const postId = get( props, 'post.ID' );
		const userId = getCurrentUserId( state );
		const planSlug = getSitePlanSlug( state, siteId );

		return {
			siteId,
			postId,
			planSlug,
			hasFetchedConnections: siteHasFetchedConnections( state, siteId ),
			hasRepublicizeFeature: hasFeature( state, siteId, FEATURE_REPUBLICIZE ),
			hasRepublicizeSchedulingFeature: hasFeature( state, siteId, FEATURE_REPUBLICIZE_SCHEDULING ),
			siteSlug: getSiteSlug( state, siteId ),
			isPublicizeEnabled: isPublicizeEnabled( state, siteId, props.post.type ),
			connections: getSiteUserConnections( state, siteId, userId ),
			requesting: isRequestingSharePost( state, siteId, postId ),
			failed: sharePostFailure( state, siteId, postId ),
			success: sharePostSuccessMessage( state, siteId, postId ),
			businessRawPrice: getSitePlanRawPrice( state, siteId, PLAN_BUSINESS, { isMonthly: true } ),
			businessDiscountedRawPrice: getPlanDiscountedRawPrice( state, siteId, PLAN_BUSINESS, { isMonthly: true } ),
			userCurrency: getCurrentUserCurrencyCode( state ),
		};
	},
	{ requestConnections, sharePost, dismissShareConfirmation }
)( localize( PostShare ) );
