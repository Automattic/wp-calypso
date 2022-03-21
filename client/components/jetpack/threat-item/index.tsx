import { Button } from '@automattic/components';
import classnames from 'classnames';
import { translate } from 'i18n-calypso';
import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ExternalLinkWithTracking from 'calypso/components/external-link/with-tracking';
import ThreatItemHeader from 'calypso/components/jetpack/threat-item-header';
import {
	getThreatFix,
	getThreatSignatureComponents,
} from 'calypso/components/jetpack/threat-item/utils';
import { recordTracksEvent } from 'calypso/state/analytics/actions/record';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import LogItem from '../log-item';
import ThreatDescription from '../threat-description';
import type { Threat } from 'calypso/components/jetpack/threat-item/types';
import type { TranslateResult } from 'i18n-calypso';

import './style.scss';
interface Props {
	threat: Threat;
	isPlaceholder: boolean;
	onFixThreat?: ( threat: Threat ) => void;
	onIgnoreThreat?: () => void;
	isFixing: boolean;
	contactSupportUrl?: string;
}

export const ThreatItemPlaceholder: React.FC = () => (
	<LogItem
		className={ classnames( 'threat-item', 'is-placeholder' ) }
		header="Placeholder threat"
		subheader="Placeholder sub header"
	/>
);

const ThreatItem: React.FC< Props > = ( {
	threat,
	isPlaceholder,
	onFixThreat,
	onIgnoreThreat,
	isFixing,
} ) => {
	const dispatch = useDispatch();

	const getTypeDescription = React.useCallback( () => {
		const threatComponents = getThreatSignatureComponents( threat );
		if ( ! threatComponents ) {
			return;
		}

		switch ( threatComponents.family ) {
			case 'backdoor':
				return translate(
					'Backdoors are pieces of code that allows unauthorized users to run arbitrary code on a website. It has fewer functions than a webshell, usually just one at a time.'
				);
			case 'ccskimmers':
				return translate(
					"Credit card skimmers, or CCSkimmers for short, as the name already defines, are malicious code, usually written in JavaScript or PHP that will monitor website's visitors' requests in order to capture payment information."
				);
			case 'cryptominer':
				return translate(
					"Cryptominers are either JavaScript code that will use the website visitors's computing power, or server runnable code that will mine for cryptocurrencies. Although there are valid cases for this use, most of them are the result of a website compromise."
				);
			case 'dropper':
				return translate(
					'Droppers, as the name implies, are malicious code known to drop an arbitrary file on the affected server. This file may contain other types of malware. Usually the source path of the dropped file is hardcoded or randomly generated.'
				);
			case 'generic':
				return translate(
					'Sometimes Jetpack has enough information to pinpoint a file as malicious. It may happen due to the presence of common Indicators of Compromise for malware. However, since the final payload is unknown, the classification is generic.'
				);
			case 'hacktool':
				return translate(
					'Hacktools are uploaded to compromised sites in order to leverage other types of attacks to the server, to attack other servers, sites or the visitors. Common types of hacktools are mailers, ddos tools, rogue IRC servers and exploit kits.'
				);
			case 'hardening':
				return translate(
					'Jetpack found that your site is hosting a tool that, if misconfigured, may lead to your site to be compromised.'
				);
			case 'malware':
				return translate(
					"Sometimes the code is so heavily obfuscated that it's hard to tell what are the final intentions of it, however, Jetpack Scan team's experience allows them to pinpoint the most common indicators and alert when something is wrong."
				);
			case 'malvertising':
				return translate(
					'Malvertising is the combination of the words Malicious and Advertising, this type of malware will inject rogue ad campaigns to the website, loading unwanted banners, pop-ups, or pop-unders, and even exploit kits targeting visitors.'
				);
			case 'phishing':
				return translate(
					'Phishing scams are well crafted pages or websites made to perfectly emulate a valid service in order to collect valuable information from the victims. It may target bank accounts, popular streaming services, and even postal offices.'
				);
			case 'redirect':
				return translate(
					'Malicious code may be installed on a compromised website to redirect visitors to unwanted destinations. Those can be websites running exploit kits, phishing or fake sites, or just sites the attacker is affiliated with and will give them money based on visits.'
				);
			case 'seospam':
				return translate(
					"Compromised websites may be used by attackers to act as part of a link farm, this is done to increase a website's Search Engine rank in detriment of causing harm on the affected sites."
				);
			case 'suspicious':
				return translate(
					"Sometimes Jetpack has enough information to pinpoint a file as potentially malicious. Or at least suspicious. This may happen due to the presence of common Indicators of Compromise for malware. However, since we don't have much information to classify it on a proper type, we recommend you review the code."
				);
			case 'uploader':
				return translate(
					'Attackers may upload a specific type of hacktool to a compromised website that will allow them to maintain access. Those tools we call Uploaders will serve only one purpose: upload files to the site.'
				);
			case 'webshell':
				return translate(
					'Webshells are complex tools that will give full control over the compromised website, and sometimes the server, to the attacker. They are known to have a nice interface and many functions.'
				);
			default:
				return;
		}
	}, [ threat ] );

	/**
	 * Render a CTA button. Currently, this button is rendered three
	 * times: in the details section, and in the `summary` and `extendSummary`
	 * sections of the header.
	 *
	 * @param {string} className A class for the button
	 */
	const renderFixThreatButton = React.useCallback(
		( className: string ) => {
			// Without this, clicking the [Fix threat] button will open the
			// entire ThreatItem element as well
			const onClickHandler = ( e: React.MouseEvent< HTMLElement > ) => {
				e.stopPropagation();
				onFixThreat && onFixThreat( threat );
			};
			return (
				<Button
					primary
					className={ classnames( 'threat-item__fix-button', className ) }
					onClick={ onClickHandler }
					disabled={ isFixing }
				>
					{ translate( 'Fix threat' ) }
				</Button>
			);
		},
		[ isFixing, onFixThreat, threat ]
	);

	const getFix = React.useCallback( (): TranslateResult | undefined => {
		if ( threat.status === 'fixed' ) {
			return;
		}

		if ( ! threat.fixable ) {
			return (
				<>
					{ ! threat.rows && (
						<p className="threat-item threat-description__section-text">
							{ translate(
								'Jetpack Scan cannot automatically fix this threat. We suggest that you resolve the threat manually: ' +
									'ensure that WordPress, your theme, and all of your plugins are up to date, and remove ' +
									'the offending code, theme, or plugin from your site.'
							) }
						</p>
					) }
					{ threat.rows && (
						<p className="threat-item threat-description__section-text">
							{ translate(
								'Jetpack Scan cannot automatically fix this threat. We suggest that you resolve the threat manually: ' +
									'ensure that WordPress, your theme, and all of your plugins are up to date, and remove or edit ' +
									'the offending post from your site.'
							) }
						</p>
					) }
					{ 'current' === threat.status && (
						<p className="threat-item threat-description__section-text">
							{ translate(
								'If you need more help to resolve this threat, we recommend {{strong}}Codeable{{/strong}}, a trusted freelancer marketplace of highly vetted WordPress experts. ' +
									'They have identified a select group of security experts to help with these projects. ' +
									'Pricing ranges from $70-120/hour, and you can get a free estimate with no obligation to hire.',
								{
									components: {
										strong: <strong />,
									},
								}
							) }
						</p>
					) }
				</>
			);
		}

		return (
			<p className="threat-item threat-description__section-text">
				{ getThreatFix( threat.fixable ) }
				<p>
					{ translate(
						'Jetpack Scan is able to automatically fix this threat for you. Since it will replace the affected file or directory the site’s look-and-feel or features can be compromised. We recommend that you check if your latest backup was performed successfully in case a restore is needed.'
					) }
				</p>
			</p>
		);
	}, [ threat ] );

	const isFixable = React.useMemo(
		() => threat.fixable && ( threat.status === 'current' || threat.status === 'ignored' ),
		[ threat ]
	);

	// We want to track which section are this toggles coming from
	const currentRoute = useSelector( getCurrentRoute );
	const currentRouteProp = React.useMemo( () => {
		return currentRoute
			? { section: currentRoute.includes( '/scan/history' ) ? 'History' : 'Scanner' }
			: {};
	}, [ currentRoute ] );
	const onOpenTrackEvent = React.useCallback(
		() =>
			dispatch(
				recordTracksEvent( 'calypso_jetpack_scan_threat_itemtoggle', {
					threat_signature: threat.signature,
					...currentRouteProp,
				} )
			),
		[ dispatch, threat, currentRouteProp ]
	);

	if ( isPlaceholder ) {
		return <ThreatItemPlaceholder />;
	}

	return (
		<LogItem
			key={ threat.id }
			className={ classnames( 'threat-item', {
				'is-fixed': threat.status === 'fixed',
				'is-ignored': threat.status === 'ignored',
				'is-current': threat.status === 'current',
			} ) }
			header={ <ThreatItemHeader threat={ threat } isStyled={ true } /> }
			clickableHeader={ true }
			onClick={ onOpenTrackEvent }
		>
			<ThreatDescription
				status={ threat.status }
				fix={ getFix() }
				problem={ threat.description }
				type={ getTypeDescription() }
				context={ threat.context }
				diff={ threat.diff }
				rows={ threat.rows }
				table={ threat.table }
				filename={ threat.filename }
				isFixable={ isFixable }
			/>

			<div className="threat-item__buttons">
				{ threat.status === 'current' && (
					<Button
						scary
						className="threat-item__ignore-button"
						onClick={ onIgnoreThreat }
						disabled={ isFixing }
					>
						{ translate( 'Ignore threat' ) }
					</Button>
				) }
				{ ! threat.fixable && 'current' === threat.status && (
					<ExternalLinkWithTracking
						className="button is-primary threat-item__codeable-button"
						href="https://codeable.io/partners/jetpack-scan/"
						target="_blank"
						rel="noopener noreferrer"
						tracksEventName="calypso_jetpack_scan_threat_codeable_estimate"
					>
						{ translate( 'Get a free estimate' ) }
					</ExternalLinkWithTracking>
				) }
				{ isFixable && renderFixThreatButton( 'is-details' ) }
			</div>
		</LogItem>
	);
};

export default ThreatItem;
