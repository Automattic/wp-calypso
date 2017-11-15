/** @format */

/**
 * External dependencies
 */

import React from 'react';

/**
 * Internal dependencies
 */
import analytics from 'lib/analytics';

export default class extends React.Component {
	static displayName = 'NextStepsBox';

	recordEvent = () => {
		analytics.ga.recordEvent( 'Me > Next > Box', this.props.stepName );
		analytics.tracks.recordEvent( 'calypso_me_next_click', {
			module: this.props.stepName,
			is_welcome: this.props.isWelcome,
		} );
	};

	render() {
		var boxClassNames = 'next-steps-box',
			bodyClassNames = 'next-steps-box__step-body',
			buttonClassNames = 'button';

		if ( this.props.primary ) {
			boxClassNames += ' is-primary';
			bodyClassNames += ' is-primary';
			buttonClassNames += ' is-primary';
		}
		return (
			<div className={ boxClassNames }>
				<div className="next-steps-box__step-header">
					<h2>{ this.props.step.title }</h2>
				</div>

				<div className={ bodyClassNames }>
					{ this.props.step.body }

					<div className="next-steps-box__step-action">
						<a
							className={ buttonClassNames }
							href={ this.props.step.buttonURL }
							onClick={ this.recordEvent }
						>
							{ this.props.step.buttonText }
						</a>
					</div>
				</div>
			</div>
		);
	}
}
