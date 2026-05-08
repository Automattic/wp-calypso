import { localizeUrl } from '@automattic/i18n-utils';
import clsx from 'clsx';
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

	if ( from === 'my-jetpack' ) {
		return translate(
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
		);
	}

	// The unified connector flow shifts the disclaimer's subject from
	// the *site* to the *account* — the connector page asks the user to
	// connect a WordPress.com account to a site that's already
	// registered, so "your account" is the truer subject and matches
	// the new H1 / subtitle voice on the same screen.
	//
	// This is a *new* English string, not yet translated. Until
	// GlotPress lands the translation we keep it scoped to the
	// connector flow only — every other surface keeps the long-shipped
	// "By connecting your site, …" wording so the existing translations
	// stay intact. Once the new string is translated everywhere we
	// expose it we can roll the unified version out to the rest of the
	// flows without a string-freeze concern.
	if ( from === 'jetpack-connector' ) {
		return translate(
			'By connecting your account, you agree to {{detailsLink}}share details{{/detailsLink}} between %(companyName)s and %(siteName)s.',
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

	return translate(
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
	const { as: Component = 'p', className } = props;
	const text = useDisclaimerText( props );

	return (
		<Component className={ clsx( Component === 'p' && 'jetpack-connect__tos-link', className ) }>
			{ text }
		</Component>
	);
}

JetpackConnectDisclaimer.propTypes = {
	companyName: PropTypes.string,
	siteName: PropTypes.string.isRequired,
	from: PropTypes.string,
	isWooJPC: PropTypes.bool,
	buttonText: PropTypes.string,
	as: PropTypes.elementType,
	className: PropTypes.string,
};

export default connect( null, {
	recordTracksEvent,
} )( localize( JetpackConnectDisclaimer ) );
