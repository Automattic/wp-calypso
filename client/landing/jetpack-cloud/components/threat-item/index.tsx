/**
 * External dependencies
 */
import React, { FunctionComponent, ReactElement } from 'react';
import { translate } from 'i18n-calypso';
import classnames from 'classnames';
import { Button } from '@automattic/components';

/**
 * Internal dependencies
 */
import LogItem from '../log-item';
import ThreatDescription from '../threat-description';
import { Threat } from 'landing/jetpack-cloud/components/threat-item/types';
import {
	getThreatType,
	getThreatFix,
	getThreatVulnerability,
} from 'landing/jetpack-cloud/components/threat-item/utils';

/**
 * Style dependencies
 */
import './style.scss';

interface Props {
	threat: Threat;
	onFixThreat?: Function;
	onIgnoreThreat?: Function;
	isFixing: boolean;
	contactSupportUrl?: string;
	header: string | ReactElement | i18nCalypso.TranslateResult;
}

const ThreatItem: FunctionComponent< Props > = ( {
	threat,
	onFixThreat,
	onIgnoreThreat,
	isFixing,
	contactSupportUrl,
	header,
} ) => {
	/**
	 * Render a CTA button. Currently, this button is rendered three
	 * times: in the details section, and in the `summary` and `extendSummary`
	 * sections of the header.
	 *
	 * @param {string} className A class for the button
	 */
	const renderFixThreatButton = React.useCallback(
		( className: string ) => {
			return (
				<Button
					compact
					className={ classnames( 'threat-item__fix-button', className ) }
					onClick={ onFixThreat }
					disabled={ isFixing }
				>
					{ translate( 'Fix threat' ) }
				</Button>
			);
		},
		[ isFixing, onFixThreat ]
	);

	const getSubHeader = React.useCallback( (): string | i18nCalypso.TranslateResult => {
		switch ( getThreatType( threat ) ) {
			case 'file':
				return translate( 'Threat found %(signature)s', {
					args: {
						signature: <span className="threat-item__alert-signature">{ threat.signature }</span>,
					},
				} );
			default:
				return getThreatVulnerability( threat );
		}
	}, [ threat ] );

	const getFix = React.useCallback( (): i18nCalypso.TranslateResult | undefined => {
		if ( threat.status === 'fixed' ) {
			return;
		}

		if ( ! threat.fixable ) {
			return translate(
				'Jetpack Scan cannot automatically fix this threat. Please {{link}}contact us{{/link}} for help.',
				{
					components: {
						link: <a href={ contactSupportUrl } rel="noopener noreferrer" target="_blank" />,
					},
				}
			);
		}

		return getThreatFix( threat.fixable );
	}, [ contactSupportUrl, threat ] );

	const isFixable = React.useMemo(
		() => threat.fixable && ( threat.status === 'current' || threat.status === 'ignored' ),
		[ threat ]
	);

	return (
		<LogItem
			className="threat-item"
			header={ header }
			subheader={ getSubHeader() }
			{ ...( isFixable ? { summary: renderFixThreatButton( 'is-summary' ) } : {} ) }
			{ ...( isFixable ? { expandedSummary: renderFixThreatButton( 'is-summary' ) } : {} ) }
			key={ threat.id }
			highlight="error"
		>
			<ThreatDescription
				status={ threat.status }
				fix={ getFix() }
				problem={ threat.description }
				context={ threat.context }
				diff={ threat.diff }
				filename={ threat.filename }
			/>

			<div className="threat-item__buttons">
				{ isFixable && renderFixThreatButton( 'is-details' ) }
				<Button
					scary
					compact
					className="threat-item__ignore-button"
					onClick={ onIgnoreThreat }
					disabled={ isFixing }
				>
					{ translate( 'Ignore threat' ) }
				</Button>
			</div>
		</LogItem>
	);
};

export default ThreatItem;
