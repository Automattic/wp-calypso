/**
 * External dependencies
 */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { localizeUrl } from 'calypso/lib/i18n-utils';

/**
 * Internal dependencies
 */
import { recordTracksEvent } from 'calypso/state/analytics/actions';

class JetpackConnectDisclaimer extends PureComponent {
	static propTypes = {
		siteName: PropTypes.string.isRequired,
	};

	handleClickDisclaimer = () => {
		this.props.recordTracksEvent( 'calypso_jpc_disclaimer_link_click' );
	};

	render() {
		const { siteName, translate } = this.props;

		const detailsLink = (
			<a
				target="_blank"
				rel="noopener noreferrer"
				onClick={ this.handleClickDisclaimer }
				href={ localizeUrl( 'https://jetpack.com/support/what-data-does-jetpack-sync/' ) }
				className="jetpack-connect__sso-actions-modal-link"
			/>
		);

		const text = translate(
			'By connecting your site, you agree to {{detailsLink}}share details{{/detailsLink}} between WordPress.com and %(siteName)s.',
			{
				components: {
					detailsLink,
				},
				args: {
					siteName,
				},
			}
		);

		return <p className="jetpack-connect__tos-link">{ text }</p>;
	}
}

export default connect( null, {
	recordTracksEvent,
} )( localize( JetpackConnectDisclaimer ) );
