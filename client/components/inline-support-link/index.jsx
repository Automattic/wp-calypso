import { Gridicon } from '@automattic/components';
import classnames from 'classnames';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import QuerySupportArticleAlternates from 'calypso/components/data/query-support-article-alternates';
import ExternalLink from 'calypso/components/external-link';
import { isDefaultLocale } from 'calypso/lib/i18n-utils';
import { localizeUrl } from 'calypso/lib/i18n-utils/localize-url';
import {
	bumpStat,
	composeAnalytics,
	recordTracksEvent,
	withAnalytics,
} from 'calypso/state/analytics/actions';
import { openSupportArticleDialog } from 'calypso/state/inline-support-article/actions';
import getCurrentLocaleSlug from 'calypso/state/selectors/get-current-locale-slug';

import './style.scss';

class InlineSupportLink extends Component {
	state = {
		shouldLazyLoadAlternates: false,
		supportDataFromContext: undefined,
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

	componentDidMount() {
		if ( this.props.supportContext && ! this.props.supportPostId && ! this.props.supportLink ) {
			// Lazy load the supportPostId and supportLink by key if not provided.
			import( './context-links' ).then( ( module ) => {
				const contextLinks = module.default;
				const supportDataFromContext = contextLinks[ this.props.supportContext ];
				if ( ! supportDataFromContext ) {
					return;
				}
				this.setState( { supportDataFromContext } );
			} );
		}
	}

	render() {
		const {
			className,
			showText,
			showIcon,
			iconSize,
			translate,
			openDialog,
			children,
			localeSlug,
		} = this.props;
		const { shouldLazyLoadAlternates } = this.state;

		let { supportPostId, supportLink } = this.props;
		if ( this.state.supportDataFromContext ) {
			supportPostId = this.state.supportDataFromContext.post_id;
			supportLink = this.state.supportDataFromContext.link;
		}

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
				onClick={ ( event ) => openDialog( event, supportPostId, url ) }
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

const mapStateToProps = ( state ) => ( {
	localeSlug: getCurrentLocaleSlug( state ),
} );

const mapDispatchToProps = ( dispatch, ownProps ) => {
	const { tracksEvent, tracksOptions, statsGroup, statsName, supportContext } = ownProps;
	return {
		openDialog: ( event, supportPostId, supportLink ) => {
			if ( ! supportPostId ) {
				return;
			}
			event.preventDefault();
			const analyticsEvents = [
				...[
					recordTracksEvent( 'calypso_inlinesupportlink_click', {
						support_context: supportContext || null,
						support_link: supportLink,
					} ),
				],
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
