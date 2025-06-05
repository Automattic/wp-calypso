import { Gridicon } from '@automattic/components';
import clsx from 'clsx';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import { bumpStat, composeAnalytics, recordTracksEvent } from 'calypso/state/analytics/actions';
import InlineSupportLink from './inline-support-link';

import './style.scss';

class UnconnectedInlineSupportLink extends Component {
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

	onSupportLinkClick( event, supportData ) {
		const { trackOpenDialog, onClick } = this.props;
		onClick?.( event );
		trackOpenDialog( event, supportData );
	}

	render() {
		const {
			className,
			showText,
			showIcon,
			linkTitle,
			iconSize,
			translate,
			children,
			noWrap,
			supportPostId,
			supportLink,
			supportContext,
			showSupportModal,
		} = this.props;

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
			<InlineSupportLink
				className={ clsx( 'inline-support-link', className ) }
				title={ linkTitle }
				supportPostId={ supportPostId }
				supportLink={ supportLink }
				supportContext={ supportContext }
				disabled={ ! showSupportModal }
				onClick={ this.onSupportLinkClick }
			>
				{ content }
			</InlineSupportLink>
		);
	}
}

const mapDispatchToProps = ( dispatch, ownProps ) => {
	const { tracksEvent, tracksOptions, statsGroup, statsName, supportContext } = ownProps;
	return {
		trackOpenDialog: ( event, supportData ) => {
			const analyticsEvents = [
				...[
					recordTracksEvent( 'calypso_inlinesupportlink_click', {
						support_context: supportContext || null,
						support_link: supportData.link,
					} ),
				],
				...( tracksEvent ? [ recordTracksEvent( tracksEvent, tracksOptions ) ] : [] ),
				...( statsGroup && statsName ? [ bumpStat( statsGroup, statsName ) ] : [] ),
			];
			if ( analyticsEvents.length > 0 ) {
				dispatch( composeAnalytics( ...analyticsEvents ) );
			}
		},
	};
};

export default connect( null, mapDispatchToProps )( localize( UnconnectedInlineSupportLink ) );
