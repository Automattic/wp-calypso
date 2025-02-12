import { useTranslate } from 'i18n-calypso';
import PropTypes from 'prop-types';
import ExternalLink from 'calypso/components/external-link';
import InfoPopover from 'calypso/components/info-popover';

import './style.scss';

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
} ) {
	const translate = useTranslate();
	const filteredPrivacyLink = makePrivacyLink( privacyLink, link );

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
						<ExternalLink href={ link } target="_blank">
							{ translate( 'Learn more' ) }
						</ExternalLink>
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
};

export default SupportInfo;
