import { Gridicon, ExternalLink } from '@automattic/components';
import { useDispatch } from '@wordpress/data';
import clsx from 'clsx';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component, MouseEvent } from 'react';
import { useAnalytics } from '../../app/analytics';
import { bumpStat } from './bump-stat';
import { composeAnalytics } from './compose-analytics';
import useSupportDocData from './use-support-doc-data';
import type { ReactNode } from 'react';
import './style.scss';

type InlineSupportLinkProps = {
	className?: string | undefined;
	supportPostId?: number | undefined;
	supportLink?: string | undefined;
	showText?: boolean | undefined;
	showIcon?: boolean | undefined;
	supportContext?: string | undefined;
	iconSize?: number | undefined;
	translate: ( ...args: string[] ) => string;
	linkTitle?: string | undefined;
	showSupportModal?: boolean | undefined;
	noWrap?: boolean | undefined;
	openDialog?: ( event: MouseEvent ) => void | undefined;
	onClick?: ( event: MouseEvent ) => void | undefined;
	children?: ReactNode[] | undefined;
};
type ConnectedInlineSupportLinkProps = Partial< InlineSupportLinkProps > & {
	supportPostId?: number | undefined;
	supportLink?: string | undefined;
	supportContext?: string | undefined;
	tracksEvent?: string | undefined;
	tracksOptions?: Record< string, unknown > | undefined;
	statsGroup?: string | undefined;
	statsName?: string | undefined;
};

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

	onSupportLinkClick = ( event: MouseEvent ) => {
		const { showSupportModal, openDialog, onClick } = this.props as InlineSupportLinkProps;
		if ( ! showSupportModal ) {
			return;
		}
		onClick?.( event );
		if ( undefined !== openDialog ) {
			openDialog( event );
		}
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
		} = this.props as InlineSupportLinkProps;

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
}: ConnectedInlineSupportLinkProps ) => {
	const { supportDocData, openSupportDoc } = useSupportDocData( {
		supportPostId,
		supportLink,
		supportContext,
	} );
	const { recordTracksEvent } = useAnalytics();

	const dispatch = useDispatch();

	const openDialog = ( event: MouseEvent ): void => {
		if ( null !== supportDocData && ! supportDocData.postId ) {
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
			dispatch( composeAnalytics( ...( analyticsEvents as object[] ) ) );
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
