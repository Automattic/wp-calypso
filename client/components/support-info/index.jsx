import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import ExternalLink from 'calypso/components/external-link';
import InfoPopover from 'calypso/components/info-popover';

import './style.scss';

function SupportInfo( { text, link, position, translate, privacyLink } ) {
	function makePrivacyLink() {
		if ( privacyLink ) {
			if ( typeof privacyLink === 'string' ) {
				return privacyLink;
			}

			return link + '#privacy';
		}

		return null;
	}

	const actualPrivacyLink = makePrivacyLink();

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
				{ actualPrivacyLink && (
					<span className="support-info__privacy">
						<ExternalLink href={ actualPrivacyLink } target="_blank" rel="noopener noreferrer">
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
