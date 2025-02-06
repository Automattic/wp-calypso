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
		isWooJPC: PropTypes.bool,
	};

	handleClickDisclaimer = () => {
		this.props.recordTracksEvent( 'calypso_jpc_disclaimer_link_click', { ...this.props } );
	};

	render() {
		const {
			companyName = 'WordPress.com',
			isWooJPC = false,
			siteName,
			from,
			translate,
		} = this.props;
		let text;

		const detailsLink = (
			<a
				target="_blank"
				rel="noopener noreferrer"
				onClick={ this.handleClickDisclaimer }
				href={ localizeUrl( 'https://jetpack.com/support/what-data-does-jetpack-sync/' ) }
				className="jetpack-connect__sso-actions-modal-link"
			/>
		);

		if ( isWooJPC ) {
			const termsOfServiceLink = (
				<a
					href={ localizeUrl( 'https://wordpress.com/tos/' ) }
					target="_blank"
					rel="noopener noreferrer"
					className="jetpack-connect__sso-actions-modal-link"
					onClick={ () => {
						this.props.recordTracksEvent( 'calypso_jpc_disclaimer_tos_link_click', {
							...this.props,
						} );
					} }
				/>
			);
			const syncDataLink = (
				<a
					href={ localizeUrl( 'https://jetpack.com/support/what-data-does-jetpack-sync/' ) }
					target="_blank"
					rel="noopener noreferrer"
					className="jetpack-connect__sso-actions-modal-link"
					onClick={ () => {
						this.props.recordTracksEvent( 'calypso_jpc_disclaimer_sync_data_link_click', {
							...this.props,
						} );
					} }
				/>
			);

			text = translate(
				'By clicking Connect to WordPress.com, you agree to our {{termsOfServiceLink}}Terms of Service{{/termsOfServiceLink}} and to {{syncDataLink}}sync your site’s data{{/syncDataLink}} with us.',
				{
					components: {
						termsOfServiceLink,
						syncDataLink,
					},
				}
			);
		} else {
			text =
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
		}

		return <p className="jetpack-connect__tos-link">{ text }</p>;
	}
}

export default connect( null, {
	recordTracksEvent,
} )( localize( JetpackConnectDisclaimer ) );
