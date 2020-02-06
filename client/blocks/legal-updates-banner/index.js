/**
 * External dependencies
 */
import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { Button, Card } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { localizeUrl } from 'lib/i18n-utils';
import { requestLegalData } from 'state/legal/actions';
import { shouldDisplayTosUpdateBanner } from 'state/selectors/should-display-tos-update-banner';

/**
 * Style dependencies
 */
import './style.scss';
import ExternalLink from 'components/external-link';

const LegalUpdateBanner = ( { fetchLegalData, needsAcceptTos } ) => {
	const translate = useTranslate();

	useEffect( () => {
		fetchLegalData();
	}, [] );

	if ( needsAcceptTos ) {
		return (
			<Card className="legal-updates-banner">
				<div className="legal-updates-banner__content">
					{ translate(
						"We've updated our {{a}}Terms of Service{{/a}}. Please take a few moments to read them. By accepting, " +
							'you agree to the updates Terms of Service.',
						{
							components: {
								a: (
									<ExternalLink
										icon
										target="_blank"
										href={ localizeUrl( 'https://wordpress.com/tos' ) }
									/>
								),
							},
						}
					) }
				</div>
				<div className="legal-updates-banner__actions">
					<Button primary className="legal-updates-banner__accept" onClick={ () => {} }>
						{ translate( 'Accept' ) }
					</Button>
				</div>
			</Card>
		);
	}

	return null;
};

export default connect(
	state => ( {
		needsAcceptTos: shouldDisplayTosUpdateBanner( state ),
	} ),
	{
		fetchLegalData: requestLegalData,
	}
)( LegalUpdateBanner );
