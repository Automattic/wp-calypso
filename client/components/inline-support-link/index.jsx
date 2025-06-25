import { Gridicon, ExternalLink } from '@automattic/components';
import clsx from 'clsx';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { useDispatch } from 'react-redux';
import { bumpStat, composeAnalytics, recordTracksEvent } from 'calypso/state/analytics/actions';
import useSupportDocData from './use-support-doc-data';
import './style.scss';

class InlineSupportLink extends Component {
	static propTypes = {
		className: PropTypes.string,
		supportPostId: PropTypes.number,
		supportLink: PropTypes.string,
		showText: PropTypes.bool,
		showIcon: PropTypes.bool,
		supportContext: PropTypes.string,
		iconSize: PropTypes.number,
		linkTitle: PropTypes.string,
		showSupportModal: PropTypes.bool,
		noWrap: PropTypes.bool,
		onClick: PropTypes.func,
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

	onSupportLinkClick = ( event ) => {
		const { showSupportModal, openDialog, onClick } = this.props;
		if ( ! showSupportModal ) {
			return;
		}
		onClick?.( event );
		openDialog( event );
	};

	render() {
		const {
			className,
			supportPostId,
			supportLink,
			showText,
			showIcon,
			linkTitle,
			iconSize,
			translate,
			children,
			noWrap,
		} = this.props;

		if ( ! supportPostId && ! supportLink ) {
			return null;
		}

		const LinkComponent = supportPostId ? 'a' : ExternalLink;
		const externalLinkProps = ! supportPostId && {
			icon: showIcon,
			iconSize,
		};

		const text = children ? children : translate( 'Learn more' );
		let content = (
			<>
				{ showText && text }
				{ supportPostId && showIcon ? <Gridicon icon="help-outline" size={ iconSize } /> : null }
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
				href={ supportLink }
				onClick={ this.onSupportLinkClick }
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

const ConnectedInlineSupportLink = ( {
	supportPostId,
	supportLink,
	supportContext,
	tracksEvent,
	tracksOptions,
	statsGroup,
	statsName,
	...props
} ) => {
	const { supportDocData, openSupportDoc } = useSupportDocData( {
		supportPostId,
		supportLink,
		supportContext,
	} );

	const dispatch = useDispatch();

	const openDialog = ( event ) => {
		if ( ! supportDocData.postId ) {
			return;
		}

		event.preventDefault();
		const analyticsEvents = [
			...[
				recordTracksEvent( 'calypso_inlinesupportlink_click', {
					support_context: supportContext || null,
					support_link: supportDocData.link,
				} ),
			],
			...( tracksEvent ? [ recordTracksEvent( tracksEvent, tracksOptions ) ] : [] ),
			...( statsGroup && statsName ? [ bumpStat( statsGroup, statsName ) ] : [] ),
		];
		if ( analyticsEvents.length > 0 ) {
			dispatch( composeAnalytics( ...analyticsEvents ) );
		}

		openSupportDoc();
	};

	if ( ! supportDocData ) {
		return null;
	}

	return (
		<InlineSupportLink
			{ ...props }
			supportPostId={ supportDocData.postId }
			supportLink={ supportDocData.link }
			openDialog={ openDialog }
		/>
	);
};

export default localize( ConnectedInlineSupportLink );
