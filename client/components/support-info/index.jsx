/** @format */

/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import InfoPopover from 'components/info-popover';
import ExternalLink from 'components/external-link';

class SupportInfo extends Component {
	static propTypes = {
		text: PropTypes.string,
		link: PropTypes.string,
		privacyLink: PropTypes.oneOfType( [ PropTypes.string, PropTypes.bool ] ),
	};

	static defaultProps = {
		text: '',
		link: '',
		privacyLink: '',
	};

	render() {
		const { text, link, translate } = this.props;
		let { privacyLink } = this.props;

		if ( ! privacyLink && privacyLink !== false && link ) {
			privacyLink = link + '#privacy';
		}

		return (
			<div className="support-info">
				<InfoPopover position="left" screenReaderText={ translate( 'Learn more' ) }>
					{ text + ' ' }
					{ link && (
						<span className="support-info__learn-more">
							<ExternalLink href={ link } target="_blank" rel="noopener noreferrer">
								{ translate( 'Learn more' ) }
							</ExternalLink>
						</span>
					) }
					{ privacyLink && (
						<span className="support-info__privacy">
							<ExternalLink href={ privacyLink } target="_blank" rel="noopener noreferrer">
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
