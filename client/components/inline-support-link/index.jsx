import classnames from 'classnames';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import QuerySupportArticleAlternates from 'calypso/components/data/query-support-article-alternates';
import ExternalLink from 'calypso/components/external-link';
import Gridicon from 'calypso/components/gridicon';
import { isDefaultLocale, localizeUrl } from 'calypso/lib/i18n-utils';
import {
	bumpStat,
	composeAnalytics,
	recordTracksEvent,
	withAnalytics,
} from 'calypso/state/analytics/actions';
import { openSupportArticleDialog } from 'calypso/state/inline-support-article/actions';
import getCurrentLocaleSlug from 'calypso/state/selectors/get-current-locale-slug';
import { getContextLinks } from './context-links';

import './style.scss';

class InlineSupportLink extends Component {
	state = {
		shouldLazyLoadAlternates: false,
	};

	static propTypes = {
		className: PropTypes.string,
		supportPostId: PropTypes.number,
		supportLink: PropTypes.string,
		showText: PropTypes.bool,
		showIcon: PropTypes.bool,
		supportContext: PropTypes.string,
		iconSize: PropTypes.number,
		tracksEvent: PropTypes.string,
		tracksOptions: PropTypes.object,
		statsGroup: PropTypes.string,
		statsName: PropTypes.string,
		localeSlug: PropTypes.string,
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
			className,
			showText,
			supportPostId,
			supportLink,
			showIcon,
			iconSize,
			translate,
			openDialog,
			children,
			localeSlug,
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
		let content = (
			<>
				{ showText && text }
				{ supportPostId && showIcon && <Gridicon icon="help-outline" size={ iconSize } /> }
			</>
		);
		/* Prevent widows, sometimes:
			No  Text, No Icon  = Widow not possible
			Yes Text, No Icon  = Widow possible
			No  Text, Yes Icon = Widow not possible
			Yes Text, Yes Icon = Widow possible
		*/
		if ( showText ) {
			content = <span className="inline-support-link__nowrap">{ content }</span>;
		}

		return (
			<LinkComponent
				className={ classnames( 'inline-support-link', className ) }
				href={ url }
				onClick={ ( event ) => openDialog( event, supportPostId, supportLink ) }
				onMouseEnter={
					! isDefaultLocale( localeSlug ) && ! shouldLazyLoadAlternates
						? this.loadAlternates
						: undefined
				}
				target="_blank"
				rel="noopener noreferrer"
				{ ...externalLinkProps }
			>
				{ shouldLazyLoadAlternates && <QuerySupportArticleAlternates postId={ supportPostId } /> }
				{ content }
			</LinkComponent>
		);
	}
}

const getLinkData = ( ownProps ) => {
	const { supportContext } = ownProps;
	const contextLinks = getContextLinks();
	const linkData = contextLinks[ supportContext ];
	if ( ! linkData ) {
		return {};
	}
	return {
		supportPostId: linkData.post_id,
		supportLink: linkData.link,
	};
};

const mapStateToProps = ( state, ownProps ) => {
	return {
		localeSlug: getCurrentLocaleSlug( state ),
		...getLinkData( ownProps ),
	};
};

const mapDispatchToProps = ( dispatch, ownProps ) => {
	const { tracksEvent, tracksOptions, statsGroup, statsName } = ownProps;
	return {
		openDialog: ( event, supportPostId, supportLink ) => {
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

export default connect( mapStateToProps, mapDispatchToProps )( localize( InlineSupportLink ) );
