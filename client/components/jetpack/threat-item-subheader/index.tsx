import classnames from 'classnames';
import { translate, useTranslate } from 'i18n-calypso';
import moment from 'moment';
import * as React from 'react';
import Badge from 'calypso/components/badge';
import { Threat } from 'calypso/components/jetpack/threat-item/types';
import {
	getThreatFamily,
	getThreatType,
	getThreatVulnerability,
} from 'calypso/components/jetpack/threat-item/utils';

import './style.scss';

interface Props {
	threat: Threat;
}

const entryActionClassNames = ( threat: Threat ) => {
	return {
		'is-fixed': threat.status === 'fixed',
		'is-ignored': threat.status === 'ignored',
	};
};

const formatDate = ( date: Date ) => {
	return moment( date ).format( 'LL' );
};

const getThreatSubTitleFromFamily = ( threat: Threat ) => {
	const family = getThreatFamily( threat );
	switch ( family ) {
		case 'backdoor':
			return translate( 'Backdoor found on your site. Please take immediate action.' );
		case 'ccskimmers':
			return translate(
				'Jetpack found a credit card skimmer script on your website, your attention is required.'
			);
		case 'cryptominer':
			return translate(
				'Jetpack found a cryptominer script on your website, your attention is required.'
			);
		case 'dropper':
			return translate(
				'A malicious code known to upload malware to servers was found on your site. Please take immediate action.'
			);
		case 'generic':
			return translate(
				'A potentially malicious file was found on your site. Please review its code.'
			);
		case 'hacktool':
			return translate( 'A hacktool was found on your site. Please take immediate action.' );
		case 'hardening':
			return translate(
				'A misconfigured or a potentially vulnerable tool was found on your site. Please take immediate action.'
			);
		case 'malware':
			return translate( 'A malware was found on your site. Please take immediate action.' );
		case 'malvertising':
			return translate(
				'A file loading malicious ad was found on your site. Please take immediate action.'
			);
		case 'phishing':
			return translate( 'A phishing page was found on your site. Please take immediate action.' );
		case 'redirect':
			return translate(
				'Your website is redirecting users to unwanted destinations. Please take immediate action.'
			);
		case 'seospam':
			return translate( 'SEO spam was found on your site. Please take immediate action.' );
		case 'suspicious':
			return translate(
				'A suspicious code was found on your site. We recommend you review it and take proper action.'
			);
		case 'uploader':
			return translate(
				'A malicious file with upload capabilities was found on your site. Please take immediate action.'
			);
		case 'webshell':
			return translate( 'A webshell was found on your site. Please take immediate action.' );
		default:
			return null;
	}
};

const getThreatStatusMessage = ( translate: ReturnType< typeof useTranslate >, threat: Threat ) => {
	const { status, fixedOn } = threat;

	const date = fixedOn && formatDate( fixedOn );

	if ( status === 'fixed' ) {
		return date
			? translate( 'Threat fixed on %(date)s', {
					args: { date },
					comment: 'Past tense action: a threat was fixed on a specific date',
			  } )
			: translate( 'Threat fixed', {
					comment: 'Past tense action: a threat was fixed on an unspecified date',
			  } );
	}

	if ( status === 'ignored' ) {
		return date
			? translate( 'Threat ignored on %(date)s', {
					args: { date },
					comment: 'Past tense action: a threat was ignored on a specific date',
			  } )
			: translate( 'Threat ignored', {
					comment: 'Past tense action: a threat was ignored on an unspecified date',
			  } );
	}

	return null;
};

// This renders two different kind of sub-headers. One is for current threats (displayed
// in the Scanner section), and the other for threats in the History section.
const ThreatItemSubheader: React.FC< Props > = ( { threat } ) => {
	const translate = useTranslate();
	if ( threat.status === 'current' ) {
		const threatSubTitleFromFamily = getThreatSubTitleFromFamily( threat );
		if ( threatSubTitleFromFamily ) {
			return <>{ threatSubTitleFromFamily }</>;
		}

		switch ( getThreatType( threat ) ) {
			case 'file':
				return (
					<>
						{ translate( 'Threat found ({{signature/}})', {
							components: {
								signature: (
									<span className="threat-item-subheader__alert-signature">
										{ threat.signature }
									</span>
								),
							},
						} ) }
					</>
				);
			default:
				return <>{ getThreatVulnerability( threat ) }</>;
		}
	} else {
		const threatStatusMessage = getThreatStatusMessage( translate, threat );

		return (
			<>
				<div className="threat-item-subheader__subheader">
					<span className="threat-item-subheader__status">
						{ translate( 'Threat found on %s', {
							args: formatDate( threat.firstDetected ),
						} ) }
					</span>
					{ threatStatusMessage && (
						<>
							<span className="threat-item-subheader__status-separator"></span>
							<span
								className={ classnames(
									'threat-item-subheader__status',
									entryActionClassNames( threat )
								) }
							>
								{ threatStatusMessage }
							</span>
						</>
					) }
				</div>
				<Badge
					className={ classnames(
						'threat-item-subheader__badge',
						entryActionClassNames( threat )
					) }
				>
					<small>
						{ threat.status === 'fixed' ? translate( 'fixed' ) : translate( 'ignored' ) }
					</small>
				</Badge>
			</>
		);
	}
};

export default ThreatItemSubheader;
