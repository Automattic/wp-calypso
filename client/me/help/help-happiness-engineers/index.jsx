/**
 * External dependencies
 */
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import React from 'react';
import PureRenderMixin from 'react-pure-render/mixin';

/**
 * Internal dependencies
 */
import FormSectionHeading from 'components/forms/form-section-heading';
import Gravatar from 'components/gravatar';
import QueryHappinessEngineers from 'components/data/query-happiness-engineers';
import { getHappinessEngineers } from 'state/happiness-engineers/selectors';

class HelpHappinessEngineers extends React.Component {
	render() {
		return (
			<div className="help-happiness-engineers">
				<QueryHappinessEngineers />
				{ this.props.translate( '{{headline}}We care about your happiness!{{/headline}}' +
								'{{p}}They don\'t call us Happiness Engineers for nothing. ' +
								'If you need help, we\'re here for you!{{/p}}',
					{
						components: {
							headline: <FormSectionHeading />,
							p: <p className="help-happiness-engineers__description" />
						}
					}
					) }
				<div className="help-happiness-engineers__tray">
					{ this.props.happinessEngineers.map(
						happinessEngineer => <Gravatar
							key={ happinessEngineer }
							user={ { avatar_URL: happinessEngineer } }
							size={ 42 } /> )
					}
				</div>
			</div>
		);
	}
}

HelpHappinessEngineers.mixins = [ PureRenderMixin ];

HelpHappinessEngineers.propTypes = {
	happinessEngineers: React.PropTypes.array
};

HelpHappinessEngineers.defaultProps = {
	happinessEngineers: []
};

export default connect(
	( state ) => {
		return {
			happinessEngineers: getHappinessEngineers( state )
		};
	}
)( localize( HelpHappinessEngineers ) );
