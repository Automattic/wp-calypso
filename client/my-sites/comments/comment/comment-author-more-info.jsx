/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import Gridicon from 'gridicons';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import Emojify from 'components/emojify';
import ExternalLink from 'components/external-link';
import InfoPopover from 'components/info-popover';
import { urlToDomainAndPath } from 'lib/url';
import { getSiteComment } from 'state/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getAuthorDisplayName } from 'my-sites/comments/comment/utils';

export class CommentAuthorMoreInfo extends Component {
	static propTypes = {
		commentId: PropTypes.number,
	};

	storeLabelRef = label => ( this.authorMoreInfoLabel = label );

	storePopoverRef = popover => ( this.authorMoreInfoPopover = popover );

	openAuthorMoreInfoPopover = event => this.authorMoreInfoPopover.handleClick( event );

	render() {
		const {
			authorDisplayName,
			authorEmail,
			authorIp,
			authorUrl,
			authorUsername,
			translate,
		} = this.props;

		return (
			<div
				className="comment__author-more-info"
				onClick={ this.openAuthorMoreInfoPopover }
				ref={ this.storeLabelRef }
			>
				<InfoPopover ignoreContext={ this.authorMoreInfoLabel } ref={ this.storePopoverRef }>
					<div className="comment__author-more-info-popover">
						<div className="comment__author-more-info-popover-element">
							<Gridicon icon="user-circle" />
							<div className="comment__author-more-info-popover-element-text">
								<div>
									<strong>{ authorDisplayName || translate( 'Anonymous' ) }</strong>
								</div>
								<div>{ authorUsername }</div>
							</div>
						</div>
						<div className="comment__author-more-info-popover-element">
							<Gridicon icon="mail" />
							<div className="comment__author-more-info-popover-element-text">
								{ authorEmail || <em>{ translate( 'No email address' ) }</em> }
							</div>
						</div>
						<div className="comment__author-more-info-popover-element">
							<Gridicon icon="link" />
							<div className="comment__author-more-info-popover-element-text">
								{ !! authorUrl && (
									<ExternalLink href={ authorUrl }>
										<Emojify>{ urlToDomainAndPath( authorUrl ) }</Emojify>
									</ExternalLink>
								) }
								{ ! authorUrl && <em>{ translate( 'No website' ) }</em> }
							</div>
							<div className="comment__author-more-info-popover-element">
								<Gridicon icon="globe" />
								<div className="comment__author-more-info-popover-element-text">
									{ authorIp || <em>{ translate( 'No IP address' ) }</em> }
								</div>
							</div>
						</div>
					</div>
				</InfoPopover>
				<label>{ translate( 'User Info' ) }</label>
			</div>
		);
	}
}

const mapStateToProps = ( state, { commentId } ) => {
	const siteId = getSelectedSiteId( state );
	const comment = getSiteComment( state, siteId, commentId );

	const authorDisplayName = getAuthorDisplayName( comment );

	return {
		authorDisplayName,
		authorEmail: get( comment, 'author.email' ),
		authorIp: get( comment, 'author.ip_address' ),
		authorUsername: get( comment, 'author.nice_name' ),
		authorUrl: get( comment, 'author.URL', '' ),
	};
};

const mapDispatchToProps = () => ( {} );

export default connect( mapStateToProps, mapDispatchToProps )( localize( CommentAuthorMoreInfo ) );
