import { ExternalLink } from '@wordpress/components';
import { translate, TranslateResult } from 'i18n-calypso';
import { PureComponent, ReactNode } from 'react';
import DiffViewer from 'calypso/components/diff-viewer';
import { ThreatStatus } from 'calypso/components/jetpack/threat-item/types';
import MarkedLines from 'calypso/components/marked-lines';

import './style.scss';

export interface Props {
	children?: ReactNode;
	status: ThreatStatus;
	problem: string | ReactNode;
	type?: string | ReactNode;
	source?: string;
	fix?: string | ReactNode;
	context?: Record< string, unknown >;
	diff?: string;
	rows?: Record< string, unknown >;
	table?: string;
	primaryKeyColumn?: string;
	value?: string;
	filename?: string;
	isFixable: boolean;
	details?: Record< string, unknown >;
}

class ThreatDescription extends PureComponent< Props > {
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
				}
				return translate( 'How to resolve or handle this detection?' );
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
		const { table, details, primaryKeyColumn, value } = this.props;
		if ( ! table || ! details ) {
			return null;
		}

		const row = {
			table,
			primary_key_column: primaryKeyColumn,
			primary_key_value: value,
			details,
		};
		const content = JSON.stringify( row, null, ' \t' ) + '\n';

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
		const { children, problem, type, source, fix, diff, rows, context, filename } = this.props;

		return (
			<div className="threat-description">
				<p className="threat-description__section-title">
					<strong>{ translate( 'What did Jetpack find?' ) }</strong>
				</p>
				{ this.renderTextOrNode( <p className="threat-description__section-text">{ problem }</p> ) }
				{ type &&
					this.renderTextOrNode( <p className="threat-description__section-text">{ type }</p> ) }
				{ source &&
					this.renderTextOrNode(
						<p className="threat-description__section-text">
							<ExternalLink href={ source }>
								{ translate( 'Learn more about this vulnerability' ) }
							</ExternalLink>
						</p>
					) }
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
