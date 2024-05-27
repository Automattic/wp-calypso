import { useTranslate } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React from 'react';
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

/**
 * Renders a support information component.
 * @param {Object} props - The component props.
 * @param {React.ReactNode} [props.children] - The child elements to be rendered inside the component.
 * @param {string} [props.text] - The text to be displayed in the component.
 * @param {string} [props.link] - The link URL to be displayed in the "Learn more" section.
 * @param {string} [props.position] - The position of the popover (default: 'left').
 * @param {boolean|string} [props.privacyLink] -Boolean whether to display the privacy link. Or the link itself.
 * @param {string} [props.popoverClassName] - The CSS class name for the popover.
 * @returns {React.ReactNode} The rendered support information component.
 */
function SupportInfo( {
	children = <></>,
	text = '',
	link = '',
	position,
	privacyLink = true,
	popoverClassName = '',
} ) {
	const translate = useTranslate();
	const filteredPrivacyLink = makePrivacyLink( privacyLink, link );

	return (
		<div className="support-info">
			<InfoPopover
				className={ popoverClassName }
				position={ position || 'left' }
				screenReaderText={ translate( 'Learn more' ) }
			>
				{ text + ' ' }
				{ children }
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

SupportInfo.propTypes = {
	text: PropTypes.string,
	link: PropTypes.string,
	position: PropTypes.string,
	privacyLink: PropTypes.oneOfType( [ PropTypes.string, PropTypes.bool ] ),
};

export default SupportInfo;
