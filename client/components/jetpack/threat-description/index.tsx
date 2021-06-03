/**
 * External dependencies
 */
import React, { ReactNode } from 'react';
import { translate, TranslateResult } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { ThreatStatus } from 'calypso/components/jetpack/threat-item/types';
import MarkedLines from 'calypso/components/marked-lines';
import DiffViewer from 'calypso/components/diff-viewer';

/**
 * Style dependencies
 */
import './style.scss';

export interface Props {
	children?: ReactNode;
	status: ThreatStatus;
	problem: string | ReactNode;
	fix?: string | ReactNode;
	context?: object;
	diff?: string;
	rows?: Record< string, unknown >;
	table?: string;
	filename?: string;
	isFixable: bool;
}

class ThreatDescription extends React.PureComponent< Props > {
	renderTextOrNode( content: string | TranslateResult | ReactNode ) {
		return <>{ content }</>;
	}

	renderFixTitle() {
		const { status, isFixable } = this.props;

		switch ( status ) {
			case 'fixed':
				return translate( 'How did Jetpack fix it?' );
				break;

			case 'current':
				if ( isFixable ) {
					return translate( 'How will we fix it?' );
				} else {
					return translate( 'Resolving the threat' );
				}
				break;

			default:
				return translate( 'How we will fix it?' );
				break;
		}
	}

	renderFilename(): ReactNode | null {
		const { filename } = this.props;
		if ( ! filename ) {
			return null;
		}

		return (
			<>
				<p className="threat-description__section-text">
					{ translate( 'Threat found in file:', {
						comment: 'filename follows in separate line; e.g. "PHP.Injection.5 in: `post.php`"',
					} ) }
				</p>
				<pre className="threat-description__alert-filename">{ filename }</pre>
			</>
		);
	}

	renderDatabaseRows(): ReactNode | null {
		const { rows, table } = this.props;
		if ( ! rows || ! table ) {
			return null;
		}

		const content = Object.values( rows ).map( ( row ) => JSON.stringify( row ) + '\n' );

		return (
			<>
				<p className="threat-description__section-text">
					{ translate( 'Threat found in the table %(threatTable)s, in the following rows:', {
						args: {
							threatTable: table,
						},
					} ) }
				</p>
				<pre className="threat-description__alert-filename">{ content }</pre>
			</>
		);
	}

	render() {
		const { children, problem, fix, diff, rows, context, filename } = this.props;

		return (
			<div className="threat-description">
				<p className="threat-description__section-title">
					<strong>{ translate( 'What was the problem?' ) }</strong>
				</p>
				{ this.renderTextOrNode( <p className="threat-description__section-text">{ problem }</p> ) }
				{ ( filename || context || diff || rows ) && (
					<p className="threat-description__section-title">
						<strong>{ translate( 'The technical details' ) }</strong>
					</p>
				) }
				{ this.renderFilename() }
				{ this.renderDatabaseRows() }
				{ context && <MarkedLines context={ context } /> }
				{ diff && <DiffViewer diff={ diff } /> }
				{ fix && (
					<p className="threat-description__section-title threat-description__section-title-fix">
						<strong>{ this.renderFixTitle() }</strong>
					</p>
				) }
				{ fix && this.renderTextOrNode( fix ) }
				{ children }
			</div>
		);
	}
}

export default ThreatDescription;
