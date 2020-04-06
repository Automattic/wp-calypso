/**
 * External dependencies
 */
import React, { ReactNode } from 'react';
import { translate } from 'i18n-calypso';

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
			return <p>{ content }</p>;
		}
		return content;
	}

	render() {
		const { children, action, details, problem, fix } = this.props;
		const isThreatFixedOrIgnored = !! action;

		return (
			<div className="threat-description">
				<strong>{ translate( 'What was the problem?' ) }</strong>
				{ this.renderTextOrNode( problem ) }
				<strong>
					{ ! isThreatFixedOrIgnored
						? translate( 'How we will fix it?' )
						: translate( 'How did Jetpack fix it?' ) }
				</strong>
				{ this.renderTextOrNode( fix ) }
				<strong>{ translate( 'The technical details' ) }</strong>
				{ this.renderTextOrNode( details ) }
				{ children }
			</div>
		);
	}
}

export default ThreatDescription;
