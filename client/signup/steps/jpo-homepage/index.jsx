/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import get from 'lodash/get';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import StepWrapper from 'signup/step-wrapper';
import SignupActions from 'lib/signup/actions';
import Card from 'components/card';
import Button from 'components/button';
import { translate } from 'i18n-calypso';
import { setJPOHomepage } from 'state/signup/steps/jpo-homepage/actions';
import StaticGraphic from './static-graphic';
import NewsGraphic from './news-graphic';

const JPOHomepageStep = React.createClass( {
	propTypes: {
		flowName: PropTypes.string,
		goToNextStep: PropTypes.func.isRequired,
		positionInFlow: PropTypes.number,
		setJPOHomepage: PropTypes.func.isRequired,
		signupProgress: PropTypes.array,
		stepName: PropTypes.string,
	},

	onSelectNews() {
		this.submitStep( 'news' );
	},

	onSelectStatic() {
		this.submitStep( 'static' );
	},

	submitStep( jpoHomepage ) {
		this.props.setJPOHomepage( jpoHomepage );

		SignupActions.submitSignupStep( {
			processingMessage: translate( 'Setting up your site' ),
			stepName: this.props.stepName,
			jpoHomepage
		}, [], { jpoHomepage } );

		this.props.goToNextStep();
	},

	skipStep() {
		this.props.goToNextStep();
	},

	renderStepContent() {
		return (
			<div className="jpo-homepage__choices">
				<Card
					className={ classNames( 'jpo-homepage__choice', {
						'is-selected': 'news' === get( this.props.signupDependencies, 'jpoHomepage', '' )
					} ) }
					>
					<a className="jpo-homepage__choice-link" href="#" onClick={ this.onSelectNews }>
						<div className="jpo-homepage__image">
							<NewsGraphic />
						</div>
						<div className="jpo-homepage__choice-copy">
							<Button className="jpo-homepage__cta" onClick={ this.onSelectNews }>
								{ translate( 'Recent news or updates' ) }
							</Button>
							<div className="jpo-homepage__description">
								{ translate( 'We can pull the latest information into your homepage for you.' ) }
							</div>
						</div>
					</a>
				</Card>
				<Card
					className={ classNames( 'jpo-homepage__choice', {
						'is-selected': 'static' === get( this.props.signupDependencies, 'jpoHomepage', '' )
					} ) }
					>
					<a className="jpo-homepage__choice-link" href="#" onClick={ this.onSelectStatic }>

						<div className="jpo-homepage__image">
							<StaticGraphic />
						</div>
						<div className="jpo-homepage__choice-copy">
							<Button className="jpo-homepage__cta" onClick={ this.onSelectStatic }>
								{ translate( 'A static welcome page' ) }
							</Button>
							<div className="jpo-homepage__description">
								{ translate( 'Have your homepage stay the same as time goes on.' ) }
							</div>
						</div>
					</a>
				</Card>
			</div>
		);
	},

	render() {
		const headerText = translate( "Let's shape %s.", {
			args: get( this.props.signupProgress[ 0 ], [ 'jpoSiteTitle', 'siteTitle' ], false ) || translate( 'your new site' )
		} );
		const subHeaderText = translate( 'What should visitors see on your homepage?' );

		return (
			<div className="jpo-homepage">
				<StepWrapper
					flowName={ this.props.flowName }
					stepName={ this.props.stepName }
					positionInFlow={ this.props.positionInFlow }
					headerText={ headerText }
					fallbackHeaderText={ headerText }
					subHeaderText={ subHeaderText }
					fallbackSubHeaderText={ subHeaderText }
					signupProgress={ this.props.signupProgress }
					stepContent={ this.renderStepContent() }
					goToNextStep={ this.skipStep }
				/>
			</div>
		);
	}
} );

export default connect(
	null,
	{
		setJPOHomepage
	}
)( JPOHomepageStep );
