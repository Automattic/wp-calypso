import { Gridicon, ExternalLink } from '@automattic/components';
import { HelpCenter } from '@automattic/data-stores';
import { localizeUrl } from '@automattic/i18n-utils';
import { dispatch as dataStoreDispatch } from '@wordpress/data';
import clsx from 'clsx';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import { bumpStat, composeAnalytics, recordTracksEvent } from 'calypso/state/analytics/actions';

import './style.scss';

const HELP_CENTER_STORE = HelpCenter.register();

class InlineSupportLink extends Component {
	state = {
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
		linkTitle: PropTypes.string,
		tracksEvent: PropTypes.string,
		tracksOptions: PropTypes.object,
		statsGroup: PropTypes.string,
		statsName: PropTypes.string,
		showSupportModal: PropTypes.bool,
		noWrap: PropTypes.bool,
	};

	static defaultProps = {
		supportPostId: null,
		supportLink: null,
		showText: true,
		showIcon: true,
		iconSize: 14,
		showSupportModal: true,
		noWrap: true,
	};

	componentDidMount() {
		if ( this.props.supportContext && ! this.props.supportPostId && ! this.props.supportLink ) {
			// Lazy load the supportPostId and supportLink by key if not provided.
			asyncRequire( './context-links' ).then( ( module ) => {
				const contextLinks = module.default;
				const supportDataFromContext = contextLinks[ this.props.supportContext ];
				if ( ! supportDataFromContext ) {
					return;
				}
				this.setState( { supportDataFromContext } );
			} );
		}
	}

	onSupportLinkClick( event, supportPostId, url, blogId ) {
		const { showSupportModal, openDialog } = this.props;
		if ( ! showSupportModal ) {
			return;
		}
		openDialog( event, supportPostId, url, blogId );
	}

	render() {
		const { className, showText, showIcon, linkTitle, iconSize, translate, children, noWrap } =
			this.props;

		let { supportPostId, supportLink } = this.props;
		let blogId; // support.wordpress is the default blog used for support links
		if ( this.state.supportDataFromContext ) {
			supportPostId = this.state.supportDataFromContext.post_id;
			supportLink = this.state.supportDataFromContext.link;
			blogId = this.state.supportDataFromContext.blog_id;
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
		if ( showText && noWrap ) {
			content = <span className="inline-support-link__nowrap">{ content }</span>;
		}

		return (
			<LinkComponent
				className={ clsx( 'inline-support-link', className ) }
				href={ url }
				onClick={ ( event ) => this.onSupportLinkClick( event, supportPostId, url, blogId ) }
				target="_blank"
				rel="noopener noreferrer"
				title={ linkTitle }
				{ ...externalLinkProps }
			>
				{ content }
			</LinkComponent>
		);
	}
}

const mapDispatchToProps = ( dispatch, ownProps ) => {
	const { tracksEvent, tracksOptions, statsGroup, statsName, supportContext } = ownProps;
	return {
		openDialog: ( event, supportPostId, supportLink, blogId ) => {
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
				dispatch( composeAnalytics( ...analyticsEvents ) );
			}

			dataStoreDispatch( HELP_CENTER_STORE ).setShowSupportDoc(
				supportLink,
				supportPostId,
				blogId
			);
		},
	};
};

export default connect( null, mapDispatchToProps )( localize( InlineSupportLink ) );
