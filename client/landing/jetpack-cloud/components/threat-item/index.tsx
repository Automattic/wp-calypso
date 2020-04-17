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
import { Threat } from 'landing/jetpack-cloud/components/threat-item/types';
import { getThreatType } from './threat';

/**
 * Style dependencies
 */
import './style.scss';

interface Props {
	threat: Threat;
	onFixThreat: Function;
	onIgnoreThreat: Function;
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
				primary
				compact
				className={ classnames( 'threat-item__fix-button', className ) }
				onClick={ onFixThreat }
				disabled={ isFixing }
			>
				{ translate( 'Fix threat' ) }
			</Button>
		);
	}

	getSubtitle( threat: Threat ) {
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
				return null;

			case 'none':
			default:
				return translate( 'Miscellaneous vulnerability' );
		}
	}

	getTitle( threat: Threat ): string | {} | React.ReactNodeArray {
		// This should be temprary since this data should be coming from the api
		// and not something that we should change to accompadate the results.
		const { filename, extension = { slug: 'unknown', version: 'n/a' } } = threat;

		const basename = filename ? filename.replace( /.*\//, '' ) : '';

		switch ( getThreatType( threat ) ) {
			case 'core':
				return translate( 'Infected core file: {{filename/}} ', {
					components: {
						filename: <code className="threat-item__alert-filename">{ basename }</code>,
					},
				} );

			case 'file':
				return translate( 'The file {{filename/}} contains a malicious code pattern.', {
					components: {
						filename: <code className="threat-item__alert-filename">{ basename }</code>,
					},
				} );

			case 'plugin':
				return translate( 'Vulnerable Plugin: {{pluginSlug/}} (version {{version/}})', {
					components: {
						pluginSlug: <span className="threat-item__alert-slug">{ extension.slug }</span>,
						version: <span className="threat-item__alert-version">{ extension.version }</span>,
					},
				} );

			case 'theme':
				return translate( 'Vulnerable Theme {{themeSlug/}} (version {{version/}})', {
					components: {
						themeSlug: <span className="threat-item__alert-slug">{ extension.slug }</span>,
						version: <span className="threat-item__alert-version">{ extension.version }</span>,
					},
				} );

			case 'database':
				if ( ! threat.rows ) {
					return translate( 'Database threat' );
				}
				return translate( 'Database %(threatCount)d threat', 'Database %(threatCount)d threats', {
					count: Object.keys( threat.rows ).length,
					args: {
						threatCount: Object.keys( threat.rows ).length,
					},
				} );

			case 'none':
			default:
				return translate( 'Threat found' );
		}
	}

	getThreatFix( threat: Threat ): string {
		switch ( getThreatType( threat ) ) {
			default:
				return 'TODO:FIX THIS CASE';
		}
	}

	render() {
		const { threat, onIgnoreThreat, isFixing } = this.props;

		const fixThreatCTA = threat.fixable ? this.renderFixThreatButton( 'is-summary' ) : null;

		return (
			<LogItem
				className="threat-item"
				header={ this.getTitle( threat ) }
				subheader={ this.getSubtitle( threat ) }
				summary={ fixThreatCTA }
				expandedSummary={ fixThreatCTA }
				key={ threat.id }
				highlight="error"
			>
				<ThreatDescription
					name={ threat.signature }
					action={ threat.action }
					details={ this.getThreatFix( threat ) }
					fix={ null }
					problem={ threat.description }
					filename={ threat.filename }
				/>

				<div className="threat-item__buttons">
					{ threat.fixable && this.renderFixThreatButton( 'is-details' ) }
					<Button
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
