/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import Gridicon from 'calypso/components/gridicon';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import ExternalLink from 'calypso/components/external-link';
import QuerySupportArticleAlternates from 'calypso/components/data/query-support-article-alternates';
import getCurrentLocaleSlug from 'calypso/state/selectors/get-current-locale-slug';
import { openSupportArticleDialog } from 'calypso/state/inline-support-article/actions';
import {
	bumpStat,
	composeAnalytics,
	recordTracksEvent,
	withAnalytics,
} from 'calypso/state/analytics/actions';
import { isDefaultLocale, localizeUrl } from 'calypso/lib/i18n-utils';

/**
 * Style dependencies
 */
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
				onClick={ openDialog }
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

const mapStateToProps = ( state ) => {
	return {
		localeSlug: getCurrentLocaleSlug( state ),
	};
};

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

export default connect( mapStateToProps, mapDispatchToProps )( localize( InlineSupportLink ) );
