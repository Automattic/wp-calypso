/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import { SharingService, connectFor } from 'my-sites/marketing/connections/service';
import { localizeUrl } from 'lib/i18n-utils';

export class Facebook extends SharingService {
	static propTypes = {
		// This foreign propTypes access should be safe because we expect all of them to be removed
		// eslint-disable-next-line react/forbid-foreign-prop-types
		...SharingService.propTypes,
	};

	static defaultProps = {
		...SharingService.defaultProps,
	};

	didKeyringConnectionSucceed( availableExternalAccounts ) {
		if ( availableExternalAccounts.length === 0 ) {
			this.props.failCreateConnection( {
				message: [
					this.props.translate(
						'The Facebook connection could not be made because this account does not have access to any Pages.',
						{
							context: 'Sharing: Publicize connection error',
						}
					),
					// Append temporary message to inform of Facebook API change
					' ',
					this.props.translate(
						'Facebook supports Publicize connections to Facebook Pages, but not to Facebook Profiles. ' +
							'{{a}}Learn More about Publicize for Facebook{{/a}}',
						{
							components: {
								a: (
									<a
										href={ localizeUrl(
											'https://wordpress.com/support/publicize/#facebook-pages'
										) }
										target="_blank"
										rel="noopener noreferrer"
									/>
								),
							},
						}
					),
				],
			} );
			this.setState( { isConnecting: false } );
			return false;
		}

		return super.didKeyringConnectionSucceed( availableExternalAccounts );
	}
}

export default connectFor( Facebook, ( state, props ) => props );
