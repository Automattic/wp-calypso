/**
 * External dependencies
 */
import React, { Component } from 'react';
import { translate } from 'i18n-calypso';
import classnames from 'classnames';
import { Button } from '@automattic/components';

/**
 * Internal dependencies
 */
import LogItem from '../log-item';
import ThreatDescription from '../threat-description';
import ThreatItemHeader from 'landing/jetpack-cloud/components/threat-item-header';
import { Threat } from 'landing/jetpack-cloud/components/threat-item/types';
import { getThreatType } from './threat';

/**
 * Style dependencies
 */
import './style.scss';

interface Props {
	threat: Threat;
	onFixThreat?: Function;
	onIgnoreThreat?: Function;
	isFixing: boolean;
}

class ThreatItem extends Component< Props > {
	/**
	 * Render a CTA button. Currently, this button is rendered three
	 * times: in the details section, and in the `summary` and `extendSummary`
	 * sections of the header.
	 *
	 * @param {string} className A class for the button
	 */
	renderFixThreatButton( className: string ) {
		const { onFixThreat, isFixing } = this.props;
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
	}

	getThreatSubHeader(): string | i18nCalypso.TranslateResult {
		const { threat } = this.props;
		switch ( getThreatType( threat ) ) {
			case 'core':
				return translate( 'Vulnerability found in WordPress' );

			case 'file':
				return translate( 'Threat found ({{signature/}})', {
					components: {
						signature: <span className="threat-item__alert-signature">{ threat.signature }</span>,
					},
				} );

			case 'plugin':
				return translate( 'Vulnerability found in plugin' );

			case 'theme':
				return translate( 'Vulnerability found in theme' );

			case 'database':
				return '';

			case 'none':
			default:
				return translate( 'Miscellaneous vulnerability' );
		}
	}

	getThreatFix(): i18nCalypso.TranslateResult {
		const { threat } = this.props;
		if ( ! threat.fixable ) {
			return translate(
				'Jetpack Scan cannot automatically fix this threat. Please {{link}}contact us{{/link}} for help.',
				{
					components: {
						link: <a href="https://jetpack.com/contact-support/" />,
					},
				}
			);
		}
		switch ( threat.fixable.fixer ) {
			case 'replace':
				return translate( 'Jetpack Scan will replace the affected file or directory.' );
			case 'delete':
				return translate( 'Jetpack Scan will delete the affected file or directory.' );
			case 'update':
				return translate( 'Jetpack Scan can update to a newer version (%(version)s).', {
					args: {
						version: threat.fixable.target || 'unknown',
					},
				} );
			default:
				return translate( 'Jetpack Scan will resolve the threat.' );
		}
	}

	render() {
		const { threat, onIgnoreThreat, isFixing } = this.props;

		const fixThreatCTA = threat.fixable ? this.renderFixThreatButton( 'is-summary' ) : null;

		return (
			<LogItem
				className="threat-item"
				header={ <ThreatItemHeader threat={ threat } /> }
				subheader={ this.getThreatSubHeader() }
				summary={ fixThreatCTA }
				expandedSummary={ fixThreatCTA }
				key={ threat.id }
				highlight="error"
			>
				<ThreatDescription
					status={ threat.status }
					fix={ this.getThreatFix() }
					problem={ threat.description }
					context={ threat.context }
					diff={ threat.diff }
					filename={ threat.filename }
				/>

				<div className="threat-item__buttons">
					{ threat.fixable && this.renderFixThreatButton( 'is-details' ) }
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
	}
}

export default ThreatItem;
