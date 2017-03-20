/**
 * External dependencies
 */
 import React, { PureComponent } from 'react';

 /**
  *
	*/
	import NpsSurvey from '../';

	class NpsSurveyExample extends PureComponent {
		constructor( props ) {
			super( props );
			this.state = {
				wasDismissed: false,
				wasSubmitted: false,
				surveyName: null,
				recommendationValue: null,
			};
			this.handleDismissed = this.handleDismissed.bind( this );
		}

		handleDismissed( event ) {
			this.setState( {
				wasDismissed: true,
				wasSubmitted: event.wasSubmitted,
				surveyName: event.surveyName,
				recommendationValue: event.recommendationValue
			} );
		}

		render() {
			return (
				<div>
					{ ! this.state.wasDismissed &&
						<NpsSurvey
							name="devdocs"
							onDismissed={ this.handleDismissed }
						/>
					}
					{ this.state.wasDismissed && this.state.wasSubmitted &&
						<div>
							User dismissed survey after submitting:
							<ul>
								<li>Survey name: { this.state.surveyName }</li>
								<li>Recommendation value: { this.state.recommendationValue }</li>
							</ul>
						</div>
					}
					{ this.state.wasDismissed && ! this.state.wasSubmitted &&
						<div>
							User dismissed survey without submitting.
						</div>
					}
				</div>
			);
		}
	}

NpsSurveyExample.displayName = 'NpsSurvey';

export default NpsSurveyExample;
