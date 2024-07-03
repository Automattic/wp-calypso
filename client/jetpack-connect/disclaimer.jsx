import { localizeUrl } from '@automattic/i18n-utils';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

class JetpackConnectDisclaimer extends PureComponent {
	static propTypes = {
		companyName: PropTypes.string,
		siteName: PropTypes.string.isRequired,
		from: PropTypes.string,
	};

	handleClickDisclaimer = () => {
		this.props.recordTracksEvent( 'calypso_jpc_disclaimer_link_click', { ...this.props } );
	};

	render() {
		const { companyName = 'WordPress.com', siteName, from, translate } = this.props;

		const detailsLink = (
			<a
				target="_blank"
				rel="noopener noreferrer"
				onClick={ this.handleClickDisclaimer }
				href={ localizeUrl( 'https://jetpack.com/support/what-data-does-jetpack-sync/' ) }
				className="jetpack-connect__sso-actions-modal-link"
			/>
		);

		const text =
			from === 'my-jetpack'
				? translate(
						'By clicking {{strong}}Approve{{/strong}}, you agree to {{detailsLink}}sync your site‘s data{{/detailsLink}} with us.',
						{
							components: {
								strong: <strong />,
								detailsLink,
							},
						}
				  )
				: translate(
						'By connecting your site, you agree to {{detailsLink}}share details{{/detailsLink}} between %(companyName)s and %(siteName)s.',
						{
							components: {
								detailsLink,
							},
							args: {
								companyName,
								siteName,
							},
							comment:
								'`companyName` is the site domain receiving the data (typically WordPress.com), and `siteName` is the site domain sharing the data.',
						}
				  );

		return <p className="jetpack-connect__tos-link">{ text }</p>;
	}
}

export default connect( null, {
	recordTracksEvent,
} )( localize( JetpackConnectDisclaimer ) );
