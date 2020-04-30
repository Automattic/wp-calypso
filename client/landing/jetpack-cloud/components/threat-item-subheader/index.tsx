/**
 * External dependencies
 */
import React from 'react';
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { Threat } from 'landing/jetpack-cloud/components/threat-item/types';
import {
	getThreatType,
	getThreatVulnerability,
} from 'landing/jetpack-cloud/components/threat-item/utils';

interface Props {
	threat: Threat;
}

const ThreatItemSubheader = ( { threat }: Props ): string | i18nCalypso.TranslateResult => {
	switch ( getThreatType( threat ) ) {
		case 'file':
			return translate( 'Threat found %(signature)s', {
				args: {
					signature: (
						<span className="threat-item-subheader__alert-signature">{ threat.signature }</span>
					),
				},
			} );
		default:
			return getThreatVulnerability( threat );
	}
};

export default ThreatItemSubheader;
