/**
 * External dependencies
 */
import React, { ReactNode } from 'react';
import { translate, TranslateResult } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import MarkedLines from 'components/marked-lines';
import DiffViewer from 'components/diff-viewer';

/**
 * Style dependencies
 */
import './style.scss';

export interface Props {
	children?: ReactNode;
	action?: 'ignored' | 'fixed';
	details: string | ReactNode;
	fix: string | ReactNode;
	problem: string | ReactNode;
	context?: object;
	diff?: string;
	filename?: string;
}

class ThreatDescription extends React.PureComponent< Props > {
	renderTextOrNode( content: string | TranslateResult | ReactNode ) {
		return <p className="threat-description__section-text">{ content }</p>;
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

	render() {
		const { children, action, details, problem, fix, diff, context, filename } = this.props;
		const isThreatFixedOrIgnored = !! action;

		return (
			<div className="threat-description">
				<p className="threat-description__section-title">
					<strong>{ translate( 'What was the problem?' ) }</strong>
				</p>
				{ this.renderTextOrNode( problem ) }
				{ fix && (
					<p className="threat-description__section-title">
						<strong>
							{ ! isThreatFixedOrIgnored
								? translate( 'How we will fix it?' )
								: translate( 'How did Jetpack fix it?' ) }
						</strong>
					</p>
				) }
				{ fix && this.renderTextOrNode( fix ) }
				{ ( details || filename || context || diff ) && (
					<p className="threat-description__section-title">
						<strong>{ translate( 'The technical details' ) }</strong>
					</p>
				) }
				{ this.renderTextOrNode( details ) }
				{ this.renderFilename() }
				{ context && <MarkedLines context={ context } /> }
				{ diff && <DiffViewer diff={ diff } /> }
				{ children }
			</div>
		);
	}
}

export default ThreatDescription;
