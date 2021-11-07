import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import { getSiteTypePropertyValue } from 'calypso/lib/signup/site-type';
import StepWrapper from 'calypso/signup/step-wrapper';
import { saveSignupStep } from 'calypso/state/signup/progress/actions';
import { getSiteType } from 'calypso/state/signup/steps/site-type/selectors';
import { submitSiteVertical } from 'calypso/state/signup/steps/site-vertical/actions';
import { getSiteVerticalIsUserInput } from 'calypso/state/signup/steps/site-vertical/selectors';
import SiteTopicForm from './form';

class SiteTopicStep extends Component {
	static propTypes = {
		flowName: PropTypes.string,
		goToNextStep: PropTypes.func.isRequired,
		isUserInput: PropTypes.bool,
		positionInFlow: PropTypes.number.isRequired,
		submitSiteVertical: PropTypes.func.isRequired,
		stepName: PropTypes.string,
		siteType: PropTypes.string,
		translate: PropTypes.func.isRequired,
	};

	static defaultProps = {
		isUserInput: true,
	};

	componentDidMount() {
		this.props.saveSignupStep( { stepName: this.props.stepName } );
	}

	submitSiteTopic = ( { isUserInput, name, slug, suggestedTheme } ) => {
		const { flowName, stepName } = this.props;
		this.props.submitSiteVertical( { isUserInput, name, slug }, stepName, suggestedTheme );
		this.props.goToNextStep( flowName );
	};

	render() {
		const headerText =
			getSiteTypePropertyValue( 'slug', this.props.siteType, 'siteTopicHeader' ) || '';
		const subHeaderText =
			getSiteTypePropertyValue( 'slug', this.props.siteType, 'siteTopicSubheader' ) || '';

		return (
			<div>
				<StepWrapper
					flowName={ this.props.flowName }
					stepName={ this.props.stepName }
					positionInFlow={ this.props.positionInFlow }
					headerText={ headerText }
					fallbackHeaderText={ headerText }
					subHeaderText={ subHeaderText }
					fallbackSubHeaderText={ subHeaderText }
					stepContent={
						<SiteTopicForm submitForm={ this.submitSiteTopic } siteType={ this.props.siteType } />
					}
					showSiteMockups={ this.props.showSiteMockups }
				/>
			</div>
		);
	}
}

export default connect(
	( state ) => ( {
		siteType: getSiteType( state ),
		isUserInput: getSiteVerticalIsUserInput( state ),
	} ),
	{ saveSignupStep, submitSiteVertical }
)( localize( SiteTopicStep ) );
