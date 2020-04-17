/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Badge from 'components/badge';
import LogItem from '../log-item';
import ThreatDescription from '../threat-description';
import MarkedLines from 'components/marked-lines';
import DiffViewer from 'components/diff-viewer';
import { withLocalizedMoment } from 'components/localized-moment';

/**
 * Style dependencies
 */
import './style.scss';

class ScanHistoryItem extends Component {
	static propTypes = {
		object: PropTypes.object,
	};

	entryActionClassNames( entry ) {
		return {
			'is-fixed': entry.status === 'fixed',
			'is-ignored': entry.status === 'ignored',
		};
	}

	formatDate( date ) {
		return this.props.moment( date ).format( 'LL' );
	}

	renderEntryHeader( entry ) {
		return (
			<>
				<div className="scan-history-item__subheader">
					<span className="scan-history-item__date">
						{ translate( 'Threat found on %s', { args: this.formatDate( entry.first_detected ) } ) }
					</span>
					{ entry.fixed_on && <span className="scan-history-item__date-separator"></span> }
					{ entry.fixed_on && (
						<span
							className={ classnames(
								'scan-history-item__date',
								this.entryActionClassNames( entry )
							) }
						>
							{ translate( 'Threat %(action)s on %(actionDate)s', {
								args: { action: entry.status, actionDate: this.formatDate( entry.fixed_on ) },
							} ) }
						</span>
					) }
				</div>
				<Badge
					className={ classnames(
						'scan-history-item__badge',
						this.entryActionClassNames( entry )
					) }
				>
					<small>{ entry.status }</small>
				</Badge>
			</>
		);
	}

	getDetailType( threat ) {
		if ( threat.hasOwnProperty( 'diff' ) ) {
			return 'core';
		}

		if ( threat.hasOwnProperty( 'context' ) ) {
			return 'file';
		}

		if ( threat.hasOwnProperty( 'extension' ) ) {
			// 'plugin' or 'theme'
			return threat.extension.type;
		}

		if ( threat.hasOwnProperty( 'rows' ) ) {
			return 'database';
		}

		if ( 'Suspicious.Links' === threat.signature ) {
			return 'database';
		}

		return 'none';
	}

	getSubtitle( threat ) {
		switch ( this.getDetailType( threat ) ) {
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

	getTitle( threat ) {
		// This should be temprary since this data should be coming from the api
		// and not something that we should change to accompadate the results.
		const { filename, extension } = threat;

		const basename = s => s.replace( /.*\//, '' );

		switch ( this.getDetailType( threat ) ) {
			case 'core':
				return translate( 'Infected core file: {{filename/}} ', {
					components: {
						filename: <code className="threat-item__alert-filename">{ basename( filename ) }</code>,
					},
				} );

			case 'file':
				return translate( 'The file {{filename/}} contains a malicious code pattern.', {
					components: {
						filename: <code className="threat-item__alert-filename">{ basename( filename ) }</code>,
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

	getThreatFix( threat ) {
		switch ( this.getDetailType( threat ) ) {
			case 'database':
				return <>TODO:FIX THIS CASE></>;
			default:
				return (
					<>
						<p className="threat-description__section-text">{ threat.description }</p>
						{ threat.filename ? (
							<>
								<p>
									{ translate( 'Threat {{threatSignature/}} found in file:', {
										comment:
											'filename follows in separate line; e.g. "PHP.Injection.5 in: `post.php`"',
										components: {
											threatSignature: (
												<span className="threat-description__alert-signature">
													{ threat.signature }
												</span>
											),
										},
									} ) }
								</p>
								<pre className="threat-description__alert-filename">{ threat.filename }</pre>
							</>
						) : (
							<p className="threat-description__section-text">{ threat.signature }</p>
						) }
						{ threat.context && <MarkedLines context={ threat.context } /> }
						{ threat.diff && <DiffViewer diff={ threat.diff } /> }
					</>
				);
		}
	}

	render() {
		const { entry } = this.props;
		if ( this.props.isPlaceholder ) {
			return (
				<LogItem
					className={ classnames( 'scan-history-item', 'is-placeholder' ) }
					header="Placeholder threat"
					subheader="Placeholder sub header"
					key={ entry.id }
				></LogItem>
			);
		}

		return (
			<LogItem
				className={ classnames( 'scan-history-item', this.entryActionClassNames( entry ) ) }
				header={ this.getTitle( entry ) }
				subheader={ this.renderEntryHeader( entry ) }
				key={ entry.id }
			>
				<ThreatDescription
					action={ entry.status }
					details={ entry.description }
					fix={ null }
					problem={ this.getThreatFix( entry ) }
				/>
			</LogItem>
		);
	}
}

export default withLocalizedMoment( ScanHistoryItem );
