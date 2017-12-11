/** @format */
/**
 * External dependencies
 */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import page from 'page';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import ExternalLink from 'components/external-link';
import { isEnabled } from 'config';
import { getSiteComment } from 'state/selectors';
import { getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';

export class CommentLink extends PureComponent {
	static propTypes = {
		commentId: PropTypes.number,
		isBulkMode: PropTypes.bool,
	};

	getFormattedDate = () => this.props.moment( this.props.commentDate ).format( 'll LT' );

	getRelativeDate = () => {
		const { commentDate, moment } = this.props;
		return moment()
			.subtract( 1, 'month' )
			.isBefore( commentDate )
			? moment( commentDate ).fromNow()
			: moment( commentDate ).format( 'll' );
	};

	handleClick = event => {
		if ( ! window ) {
			return;
		}
		event.preventDefault();
		window.scrollTo( 0, 0 );

		const { commentId, siteSlug } = this.props;
		const path = get( window, 'history.state.path' );

		const newPath =
			-1 !== path.indexOf( '#' )
				? path.replace( /[#].*/, `#comment-${ commentId }` )
				: `${ path }#comment-${ commentId }`;

		window.history.replaceState( { ...window.history.state, path: newPath }, null );

		page( `/comment/${ siteSlug }/${ commentId }` );
	};

	render() {
		const { commentId, commentUrl, isBulkMode, siteSlug } = this.props;

		return isEnabled( 'comments/management/comment-view' ) ? (
			<a
				href={ `/comment/${ siteSlug }/${ commentId }` }
				onClick={ this.handleClick }
				tabIndex={ isBulkMode ? -1 : 0 }
				title={ this.getFormattedDate() }
			>
				{ this.getRelativeDate() }
			</a>
		) : (
			<ExternalLink
				href={ commentUrl }
				tabIndex={ isBulkMode ? -1 : 0 }
				title={ this.getFormattedDate() }
			>
				{ this.getRelativeDate() }
			</ExternalLink>
		);
	}
}

const mapStateToProps = ( state, { commentId } ) => {
	const siteId = getSelectedSiteId( state );
	const siteSlug = getSelectedSiteSlug( state );
	const comment = getSiteComment( state, siteId, commentId );

	return {
		commentDate: get( comment, 'date' ),
		commentUrl: get( comment, 'URL' ),
		siteSlug,
	};
};

export default connect( mapStateToProps )( localize( CommentLink ) );
