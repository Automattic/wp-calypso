import { ExternalLink } from '@automattic/components';
import { HelpCenter } from '@automattic/data-stores';
import { localizeUrl } from '@automattic/i18n-utils';
import { dispatch as dataStoreDispatch } from '@wordpress/data';
import { useTranslate } from 'i18n-calypso';
import PropTypes from 'prop-types';
import InfoPopover from 'calypso/components/info-popover';

import './style.scss';

const HELP_CENTER_STORE = HelpCenter.register();

function makePrivacyLink( privacyLink = true, link = '' ) {
	if ( privacyLink ) {
		if ( typeof privacyLink === 'string' ) {
			return privacyLink;
		}

		return link + '#privacy';
	}

	return null;
}

function SupportInfo( {
	children,
	text,
	link,
	position = 'left',
	privacyLink,
	popoverClassName = '',
	supportPostId,
	supportBlogId,
} ) {
	const translate = useTranslate();
	const filteredPrivacyLink = makePrivacyLink( privacyLink, link );

	const handleLinkClick = ( event, url ) => {
		if ( supportPostId ) {
			event.preventDefault();
			dataStoreDispatch( HELP_CENTER_STORE ).setShowSupportDoc( url, supportPostId, supportBlogId );
		}
		// If no supportPostId, let the link open normally in a new tab
	};

	const LinkComponent = supportPostId ? 'a' : ExternalLink;
	const linkUrl = supportPostId ? localizeUrl( link ) : link;

	return (
		<div className="support-info">
			<InfoPopover
				className={ popoverClassName }
				position={ position }
				screenReaderText={ translate( 'Learn more' ) }
			>
				{ text }
				{ children }
				{ link || filteredPrivacyLink ? ' ' : null }
				{ link && (
					<span className="support-info__learn-more">
						<LinkComponent
							href={ linkUrl }
							target={ supportPostId ? undefined : '_blank' }
							onClick={ ( event ) => handleLinkClick( event, linkUrl ) }
						>
							{ translate( 'Learn more' ) }
						</LinkComponent>
					</span>
				) }
				{ filteredPrivacyLink && (
					<span className="support-info__privacy">
						<ExternalLink href={ filteredPrivacyLink } target="_blank">
							{ translate( 'Privacy Information' ) }
						</ExternalLink>
					</span>
				) }
			</InfoPopover>
		</div>
	);
}

SupportInfo.propTypes = {
	children: PropTypes.node,
	text: PropTypes.string,
	link: PropTypes.string,
	position: PropTypes.string,
	privacyLink: PropTypes.oneOfType( [ PropTypes.string, PropTypes.bool ] ),
	popoverClassName: PropTypes.string,
	supportPostId: PropTypes.number,
	supportBlogId: PropTypes.number,
};

export default SupportInfo;
