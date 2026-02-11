import { localizeUrl } from '@automattic/i18n-utils';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

export function useDisclaimerText( props ) {
	const {
		companyName = 'WordPress.com',
		isWooJPC = false,
		siteName,
		from,
		translate,
		buttonText,
	} = props;

	const detailsLink = (
		<a
			target="_blank"
			rel="noopener noreferrer"
			onClick={ () => {
				props.recordTracksEvent( 'calypso_jpc_disclaimer_link_click', { ...props } );
			} }
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
					props.recordTracksEvent( 'calypso_jpc_disclaimer_tos_link_click', {
						...props,
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
					props.recordTracksEvent( 'calypso_jpc_disclaimer_sync_data_link_click', {
						...props,
					} );
				} }
			/>
		);

		return translate(
			'By clicking Connect to WordPress.com, you agree to our {{termsOfServiceLink}}Terms of Service{{/termsOfServiceLink}} and to {{syncDataLink}}sync your site’s data{{/syncDataLink}} with us.',
			{
				components: {
					termsOfServiceLink,
					syncDataLink,
				},
			}
		);
	}

	return from === 'my-jetpack'
		? translate(
				'By clicking {{strong}}%(buttonLabel)s{{/strong}}, you agree to {{detailsLink}}sync your site‘s data{{/detailsLink}} with us.',
				{
					args: {
						buttonLabel: buttonText ? buttonText : translate( 'Approve' ),
					},
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

function JetpackConnectDisclaimer( props ) {
	const text = useDisclaimerText( props );

	return <p className="jetpack-connect__tos-link">{ text }</p>;
}

JetpackConnectDisclaimer.propTypes = {
	companyName: PropTypes.string,
	siteName: PropTypes.string.isRequired,
	from: PropTypes.string,
	isWooJPC: PropTypes.bool,
	buttonText: PropTypes.string,
};

export default connect( null, {
	recordTracksEvent,
} )( localize( JetpackConnectDisclaimer ) );
