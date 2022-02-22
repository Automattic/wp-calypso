import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import ExternalLink from 'calypso/components/external-link';
import InfoPopover from 'calypso/components/info-popover';

import './style.scss';

function makePrivacyLink( privacyLink, link ) {
	if ( privacyLink ) {
		if ( typeof privacyLink === 'string' ) {
			return privacyLink;
		}

		return link + '#privacy';
	}

	return null;
}

function SupportInfo( { text, link, position, translate, privacyLink } ) {
	const filteredPrivacyLink = makePrivacyLink( privacyLink, link );

	return (
		<div className="support-info">
			<InfoPopover position={ position || 'left' } screenReaderText={ translate( 'Learn more' ) }>
				{ text + ' ' }
				{ link && (
					<span className="support-info__learn-more">
						<ExternalLink href={ link } target="_blank" rel="noopener noreferrer">
							{ translate( 'Learn more' ) }
						</ExternalLink>
					</span>
				) }
				{ filteredPrivacyLink && (
					<span className="support-info__privacy">
						<ExternalLink href={ filteredPrivacyLink } target="_blank" rel="noopener noreferrer">
							{ translate( 'Privacy Information' ) }
						</ExternalLink>
					</span>
				) }
			</InfoPopover>
		</div>
	);
}

SupportInfo.defaultProps = {
	text: '',
	link: '',
	privacyLink: true,
};

SupportInfo.propTypes = {
	text: PropTypes.string,
	link: PropTypes.string,
	position: PropTypes.string,
	privacyLink: PropTypes.oneOfType( [ PropTypes.string, PropTypes.bool ] ),
};

export default localize( SupportInfo );
