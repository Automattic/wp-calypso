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
import Button from 'components/button';
import ButtonGroup from 'components/button-group';
import { isPublicizeEnabled } from 'state/selectors';
import {
	getSiteSlug,
	getSitePlanSlug,
} from 'state/sites/selectors';
import { getCurrentUserId, getCurrentUserCurrencyCode } from 'state/current-user/selectors';
import { getSiteUserConnections, hasFetchedConnections } from 'state/sharing/publicize/selectors';
import { fetchConnections as requestConnections, sharePost, dismissShareConfirmation } from 'state/sharing/publicize/actions';
import { isRequestingSharePost, sharePostFailure, sharePostSuccessMessage } from 'state/sharing/publicize/selectors';
import PostMetadata from 'lib/post-metadata';
import PublicizeMessage from 'post-editor/editor-sharing/publicize-message';
import Notice from 'components/notice';
import NoticeAction from 'components/notice/notice-action';
import QueryPublicizeConnections from 'components/data/query-publicize-connections';
import {
	hasFeature,
	getSitePlanRawPrice,
	getPlanDiscountedRawPrice,
} from 'state/sites/plans/selectors';
import {
	FEATURE_REPUBLICIZE,
	PLAN_BUSINESS,
} from 'lib/plans/constants';

import SectionNav from 'components/section-nav';
import NavTabs from 'components/section-nav/tabs';
import NavItem from 'components/section-nav/item';
import Banner from 'components/banner';
import Connection from './connection';
import ActionsList from './publicize-actions-list';
import { isEnabled } from 'config';
import CalendarButton from 'blocks/calendar-button';
import formatCurrency from 'lib/format-currency';
import {
	SCHEDULED,
	PUBLISHED,
} from './constants';

class PostShare extends Component {
	static propTypes = {
		connections: PropTypes.array,
		hasFetchedConnections: PropTypes.bool,
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
	};

	setFooterSection = selectedShareTab => () => this.setState( { selectedShareTab } );

	hasConnections() {
		return !! get( this.props, 'connections.length' );
	}

	isSchedulingEnabled() {
		return this.props.planSlug === PLAN_BUSINESS && isEnabled( 'publicize-scheduling' );
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

	renderServices() {
		if ( ! this.props.site || ! this.hasConnections() ) {
			return;
		}

		return this.props.connections.map( connection =>
			<Connection
				connection={ connection }
				onToggle= { this.toggleConnection }
				isActive={ this.isConnectionActive( connection ) }
				key={ connection.keyring_connection_ID }
			/>
		);
	}

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
		const { siteId, translate } = this.props;
		return (
			<div className="post-share__button-actions">
				<Button onClick={ this.previewSharingPost }>
					{ translate( 'Preview' ) }
				</Button>

				<ButtonGroup className="post-share__share-combo">
					<Button
						className="post-share__button"
						primary
						onClick={ this.sharePost }
						disabled={ this.isButtonDisabled() }
					>
						{ translate( 'Share post' ) }
					</Button>

					<CalendarButton
						primary
						className="post-share__schedule-button"
						title={ translate( 'Set date and time' ) }
						tabIndex={ 3 }
						siteId={ siteId }
						popoverPosition="bottom left" />
				</ButtonGroup>
			</div>
		);
	}

	renderUpgradeNudge() {
		if ( this.isSchedulingEnabled ) {
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
				description={ translate( 'Live chat support and no advertising.' ) }
				list={ [
					translate( 'Live chat support' ),
					translate( 'No Advertising' )
				] }
				plan={ PLAN_BUSINESS }
				title={ translate( 'Upgrade to a Business Plan!' ) }
			/>
		);
	}

	renderFooter() {
		if ( ! this.isSchedulingEnabled ) {
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

	render() {
		if ( ! this.props.isPublicizeEnabled ) {
			return null;
		}

		if ( ! this.props.planHasRepublicizeFeature ) {
			return ( <div className="post-share">
				<Banner
					feature="republicize"
					title={ this.props.translate( 'Unlock the ability to re-share posts to social media' ) }
					callToAction={ this.props.translate( 'Upgrade to Premium' ) }
					description={ this.props.translate( 'Get unlimited premium themes, video uploads, monetize your site and more.' ) }
				/>
			</div> );
		}

		const classes = classNames( 'post-share__wrapper', {
			'has-connections': this.hasConnections()
		} );

		const {
			connections,
			failure,
			postId,
			requesting,
			siteId,
			siteSlug,
			success,
			translate,
		} = this.props;

		if ( ! siteId || ! postId ) {
			return null;
		}

		return (
			<div className="post-share">
				{ requesting &&
					<Notice status="is-warning" showDismiss={ false }>
							{ translate( 'Sharing…' ) }
					</Notice>
				}

				{ success &&
					<Notice status="is-success" onDismissClick={ this.dismiss }>
						{ translate( 'Post shared. Please check your social media accounts.' ) }
					</Notice>
				}

				{ failure &&
					<Notice status="is-error" onDismissClick={ this.dismiss }>
						{ translate( 'Something went wrong. Please don\'t be mad.' ) }
						</Notice>
				}

				<div className={ classes }>
					<QueryPublicizeConnections siteId={ siteId } />
					<QueryPostTypes siteId={ siteId } />

					<div className="post-share__head">
						<h4 className="post-share__title">
							{ translate( 'Share this post' ) }
						</h4>
						<div className="post-share__subtitle">
							{ translate(
								'Share your post on all of your connected social media accounts using ' +
								'{{a}}Publicize{{/a}}.', {
									components: {
										a: <a href={ '/sharing/' + siteSlug } />
									}
								}
							) }
						</div>
					</div>

					{ ! this.props.hasFetchedConnections &&
						<div className="post-share__main">
							<div className="post-share__form is-placeholder" />
							<div className="post-share__services is-placeholder" />
						</div>
					}

					{ this.props.hasFetchedConnections && this.hasConnections() &&
						<div>
							<div>
								{ connections
									.filter( connection => connection.status === 'broken' )
									.map( connection => <Notice
										key={ connection.keyring_connection_ID }
										status="is-warning"
										showDismiss={ false }
										text={ translate( 'There is an issue connecting to %s.', { args: connection.label } ) }
									>
										<NoticeAction href={ '/sharing/' + siteSlug }>
											{ translate( 'Reconnect' ) }
										</NoticeAction>
									</Notice> )
								}
							</div>

							<div className="post-share__main">
								<div className="post-share__form">
									{ this.renderMessage() }
									{ this.renderShareButton() }
								</div>

								<div className="post-share__services">
									<h5 className="post-share__services-header">
										{ translate( 'Connected services' ) }
									</h5>
									{ this.renderServices() }
									<Button
										href={ '/sharing/' + siteId }
										compact={ true }
										className="post-share__services-add"
									>
										{ translate( 'Add account' ) }
									</Button>
								</div>
							</div>

							{ this.renderUpgradeNudge() }
							{ this.renderFooter() }
						</div>
					}

					{ this.props.hasFetchedConnections && ! this.hasConnections() &&
						<Notice
							status="is-warning"
							showDismiss={ false }
							text={ translate( 'Connect an account to get started.' ) }
						>
							<NoticeAction href={ '/sharing/' + siteSlug }>
								{ translate( 'Settings' ) }
							</NoticeAction>
						</Notice>
					}
				</div>
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
			planHasRepublicizeFeature: hasFeature( state, siteId, FEATURE_REPUBLICIZE ),
			siteSlug: getSiteSlug( state, siteId ),
			isPublicizeEnabled: isPublicizeEnabled( state, siteId, props.post.type ),
			connections: getSiteUserConnections( state, siteId, userId ),
			hasFetchedConnections: hasFetchedConnections( state, siteId ),
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
