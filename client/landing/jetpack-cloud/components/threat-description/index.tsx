/**
 * External dependencies
 */
import React, { ReactNode } from 'react';
import { translate } from 'i18n-calypso';

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
}

class ThreatDescription extends React.PureComponent< Props > {
	renderTextOrNode( content: string | ReactNode ) {
		if ( typeof content === 'string' ) {
			return <p className="threat-description__section-text">{ content }</p>;
		}
		return content;
	}

	render() {
		const { children, action, details, problem, fix } = this.props;
		const isThreatFixedOrIgnored = !! action;

		return (
			<div className="threat-description">
				<p className="threat-description__section-title">
					<strong>{ translate( 'What was the problem?' ) }</strong>
				</p>
				{ this.renderTextOrNode( problem ) }
				<p className="threat-description__section-title">
					<strong>
						{ ! isThreatFixedOrIgnored
							? translate( 'How we will fix it?' )
							: translate( 'How did Jetpack fix it?' ) }
					</strong>
				</p>
				{ this.renderTextOrNode( fix ) }
				<p className="threat-description__section-title">
					<strong>{ translate( 'The technical details' ) }</strong>
				</p>
				{ this.renderTextOrNode( details ) }
				{ children }
			</div>
		);
	}
}

export default ThreatDescription;
