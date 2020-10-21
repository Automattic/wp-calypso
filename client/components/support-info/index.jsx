/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import InfoPopover from 'calypso/components/info-popover';
import ExternalLink from 'calypso/components/external-link';

/**
 * Style dependencies
 */
import './style.scss';

class SupportInfo extends Component {
	static propTypes = {
		text: PropTypes.string,
		link: PropTypes.string,
		position: PropTypes.string,
		privacyLink: PropTypes.oneOfType( [ PropTypes.string, PropTypes.bool ] ),
	};

	static defaultProps = {
		text: '',
		link: '',
		privacyLink: '',
	};

	render() {
		const { text, link, position, privacyLink, translate } = this.props;
		const actualPrivacyLink =
			! privacyLink && privacyLink !== false && link ? link + '#privacy' : privacyLink;

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
}

export default localize( SupportInfo );
