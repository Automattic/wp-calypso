/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import Gridicon from 'components/gridicon';

/**
 * Internal dependencies
 */
import ExternalLink from 'components/external-link';
import QuerySupportArticleAlternates from 'components/data/query-support-article-alternates';
import { openSupportArticleDialog } from 'state/inline-support-article/actions';
import {
	bumpStat,
	composeAnalytics,
	recordTracksEvent,
	withAnalytics,
} from 'state/analytics/actions';
import { localizeUrl } from 'lib/i18n-utils';

/**
 * Style dependencies
 */
import './style.scss';

class InlineSupportLink extends Component {
	state = {
		shouldLazyLoadAlternates: false,
	};

	static propTypes = {
		supportPostId: PropTypes.number,
		supportLink: PropTypes.string,
		showText: PropTypes.bool,
		showIcon: PropTypes.bool,
		iconSize: PropTypes.number,
		tracksEvent: PropTypes.string,
		tracksOptions: PropTypes.object,
		statsGroup: PropTypes.string,
		statsName: PropTypes.string,
	};

	static defaultProps = {
		supportPostId: null,
		supportLink: null,
		showText: true,
		showIcon: true,
		iconSize: 14,
	};

	loadAlternates = () => {
		this.setState( { shouldLazyLoadAlternates: true } );
	};

	render() {
		const {
			showText,
			supportPostId,
			supportLink,
			showIcon,
			iconSize,
			translate,
			openDialog,
			children,
		} = this.props;
		const { shouldLazyLoadAlternates } = this.state;

		if ( ! supportPostId && ! supportLink ) {
			return null;
		}

		const LinkComponent = supportPostId ? 'a' : ExternalLink;
		const url = supportPostId ? localizeUrl( supportLink ) : supportLink;
		const externalLinkProps = ! supportPostId && {
			icon: showIcon,
			iconSize,
		};

		const text = children ? children : translate( 'Learn more' );

		return (
			<LinkComponent
				className="inline-support-link"
				href={ url }
				onClick={ openDialog }
				onMouseEnter={ ! shouldLazyLoadAlternates && this.loadAlternates }
				target="_blank"
				rel="noopener noreferrer"
				{ ...externalLinkProps }
			>
				{ shouldLazyLoadAlternates && <QuerySupportArticleAlternates postId={ supportPostId } /> }
				{ showText && text }
				{ supportPostId && showIcon && <Gridicon icon="help-outline" size={ iconSize } /> }
			</LinkComponent>
		);
	}
}

const mapDispatchToProps = ( dispatch, ownProps ) => {
	const {
		tracksEvent,
		tracksOptions,
		statsGroup,
		statsName,
		supportPostId,
		supportLink,
	} = ownProps;
	return {
		openDialog: ( event ) => {
			if ( ! supportPostId ) {
				return;
			}
			event.preventDefault();
			const analyticsEvents = [
				...( tracksEvent ? [ recordTracksEvent( tracksEvent, tracksOptions ) ] : [] ),
				...( statsGroup && statsName ? [ bumpStat( statsGroup, statsName ) ] : [] ),
			];
			if ( analyticsEvents.length > 0 ) {
				return dispatch(
					withAnalytics(
						composeAnalytics( ...analyticsEvents ),
						openSupportArticleDialog( { postId: supportPostId, postUrl: supportLink } )
					)
				);
			}
			return dispatch(
				openSupportArticleDialog( {
					postId: supportPostId,
					postUrl: supportLink,
				} )
			);
		},
	};
};

export default connect( null, mapDispatchToProps )( localize( InlineSupportLink ) );
