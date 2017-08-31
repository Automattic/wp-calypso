/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Gridicon from 'gridicons';
import get from 'lodash/get';
import some from 'lodash/some';
import extend from 'lodash/extend';

/**
 * Internal dependencies
 */
import StepWrapper from 'signup/step-wrapper';
import { translate } from 'i18n-calypso';
import { setJPOSummary } from 'state/signup/steps/jpo-summary/actions';
import { updateSettings } from 'state/jetpack/settings/actions';
import { installPlugin } from 'state/plugins/installed/actions';
import { addWidget } from 'state/widgets/actions';

class JPOSummaryStep extends React.Component {

	static propTypes = {
		flowName: PropTypes.string,
		goToNextStep: PropTypes.func.isRequired,
		positionInFlow: PropTypes.number,
		setJPOSummary: PropTypes.func.isRequired,
		signupProgress: PropTypes.array,
		stepName: PropTypes.string,
		signupDependencies: PropTypes.shape( {
			jpoSiteTitle: PropTypes.shape( {
				siteTitle: PropTypes.string,
				siteDescription: PropTypes.string
			} ),
			jpoSiteType: PropTypes.shape( {
				genre: PropTypes.string,
				businessPersonal: PropTypes.string,
				businessName: PropTypes.string,
				businessAddress: PropTypes.string,
				businessCity: PropTypes.string,
				businessState: PropTypes.string,
				businessZipCode: PropTypes.string,
			} ),
			jpoHomepage: PropTypes.string,
			jpoContactForm: PropTypes.bool,
			jpoConnect: PropTypes.object.isRequired
		} ).isRequired,
		isSavingSettings: PropTypes.bool
	};

	constructor( props ) {
		super( props );
		this.state = {
			pluginsReady: 'no',
			settingsReady: 'no',
			widgetsReady: 'no',
		};
		this.getOnboardingChoices = this.getOnboardingChoices.bind( this );
		this.renderStepContent = this.renderStepContent.bind( this );
	}

	getOnboardingChoices() {
		const data = this.props.signupDependencies;
		let sendToJetpack = {
			onboarding: {
				siteTitle: get( data, [ 'jpoSiteTitle', 'siteTitle' ], '' ),
				siteDescription: get( data, [ 'jpoSiteTitle', 'siteDescription' ], '' ),

				genre: get( data, [ 'jpoSiteType', 'genre' ], '' ),
				businessPersonal: get( data, [ 'jpoSiteType', 'businessPersonal' ], '' ),
				businessInfo: {
					businessName: get( data, [ 'jpoSiteType', 'businessName' ], '' ),
					businessAddress: get( data, [ 'jpoSiteType', 'streetAddress' ], '' ),
					businessCity: get( data, [ 'jpoSiteType', 'city' ], '' ),
					businessState: get( data, [ 'jpoSiteType', 'state' ], '' ),
					businessZipCode: get( data, [ 'jpoSiteType', 'zipCode' ], '' ),
				},

				homepageFormat: get( data, 'jpoHomepage', '' ),

				addContactForm: get( data, 'jpoContactForm', false )
			}
		};

		switch ( sendToJetpack.onboarding.genre ) {
			case 'portfolio':
				sendToJetpack = extend( {}, sendToJetpack, {
					'custom-content-types': true,
					jetpack_portfolio: true
				} );
				break;

			case 'website':
			case 'store':
				sendToJetpack = extend( {}, sendToJetpack, {
					'custom-content-types': true,
					jetpack_testimonial: true
				} );
				break;
		}

		if ( sendToJetpack.onboarding.addContactForm ) {
			sendToJetpack = extend( {}, sendToJetpack, {
				'contact-form': true
			} );
		}

		if ( some( sendToJetpack.onboarding.businessInfo, i => '' !== i ) ) {
			sendToJetpack = extend( {}, sendToJetpack, {
				widgets: true,
			} );
		}

		return sendToJetpack;
	}

	renderStepContent() {
		const connectionToJetpackComplete = true;

		const checkMark = <Gridicon
			className="jpo-summary__item-checkmark"
			size={ 12 }
			icon="checkmark"
			/>;

		const {
			signupProgress: {
				0: {
					jpoSiteTitle
				},
				1: {
					jpoSiteType
				},
				2: {
					jpoHomepage
				},
				3: {
					jpoContactForm
				}
			}
		} = this.props;

		const pathPrefix = '/start/jetpack-onboarding/';

		return (
			<div className="jpo__summary-wrapper">
				<table>
					<tbody>
						<tr>
							<td>
								<div className="jpo__summary-col-header jpo-summary__col-header">
									{
										translate( "Steps you've completed:" )
									}
								</div>
								<ul className="jpo-summary__completed-onboarding">
									{
										jpoSiteTitle
											? <li>{ checkMark } <span>{ translate( 'Site Title & Description' ) }</span></li>
											: null
									}
									{
										jpoSiteType
											? <li>{ checkMark } <span>{ translate( 'Type of Site' ) }</span></li>
											: null
									}
									{
										jpoHomepage
											? <li>{ checkMark } <span>{ translate( 'Type of Homepage' ) }</span></li>
											: null
									}
									{
										jpoContactForm
											? <li>{ checkMark } <span>{ translate( 'Contact Us Form' ) }</span></li>
											: null
									}
									{
										connectionToJetpackComplete
											? <li>{ checkMark } <span>{ translate( 'Jetpack Connection' ) }</span></li>
											: null
									}
								</ul>
							</td>
							<td>
								<div className="jpo__summary-col-header jpo-summary__col-header">
									{
										translate( 'Continue your site setup:' )
									}
								</div>
								<ul className="jpo-summary__more-onboarding">
									{
										jpoSiteTitle
											? null
											: <li><a href={ `${ pathPrefix }jpo-site-title` }>{ translate( 'Site Title & Description' ) }</a></li>
									}
									{
										jpoSiteType
											? null
											: <li><a href={ `${ pathPrefix }jpo-site-type` }>{ translate( 'Type of Site' ) }</a></li>
									}
									{
										jpoHomepage
											? null
											: <li><a href={ `${ pathPrefix }jpo-homepage` }>{ translate( 'Type of Homepage' ) }</a></li>
									}
									{
										jpoContactForm
											? null
											: <li><a href={ `${ pathPrefix }jpo-contact-form` }>{ translate( 'Contact Us Form' ) }</a></li>
									}
									{ ! connectionToJetpackComplete ? <li>{ translate( 'Jetpack Connection' ) }</li> : null }
									<li><a href="#">{ translate( 'Choose a Theme' ) }</a></li>
									<li><a href="#">{ translate( 'Add a Site Address' ) }</a></li>
									<li><a href="#">{ translate( 'Add a Store' ) }</a></li>
									<li><a href="#">{ translate( 'Start a Blog' ) }</a></li>
								</ul>
							</td>
						</tr>
					</tbody>
				</table>
				<div>
					<a
						className="jpo-summary__visit-site button is-primary"
						href={ get( this.props.signupDependencies, [ 'jpoConnect', 'queryObject', 'home_url' ] ) }>
						{
							translate( 'Visit site' )
						}
					</a>
				</div>
			</div>
		);
	}

	componentWillReceiveProps() {
		const choices = this.getOnboardingChoices();
		const siteId = get( this.props.signupDependencies, [ 'jpoConnect', 'queryObject', 'client_id' ], -1 );

		if ( 'no' === this.state.pluginsReady ) {
			this.setState( { pluginsReady: 'progress' } );
			if ( 'store' === choices.onboarding.genre ) {
				this.props.installPlugin(
					siteId,
					{
						slug: 'woocommerce',
						id: 'woocommerce/woocommerce'
					}
					).then( () => this.setState( { pluginsReady: 'yes' } ) );
			} else {
				this.setState( { pluginsReady: 'yes' } );
			}
		}

		if ( 'no' === this.state.settingsReady ) {
			this.setState( { settingsReady: 'progress' } );
			this.props.updateSettings(
				siteId,
				choices,
				false // don't sanitize settings
			).then( () => this.setState( { settingsReady: 'yes' } ) );
		}

		if ( 'no' === this.state.widgetsReady ) {
			this.setState( { widgetsReady: 'progress' } );
			if ( some( choices.onboarding.businessInfo, i => '' !== i ) ) {
				const {
					businessName,
					businessAddress,
					businessCity,
					businessState,
					businessZipCode
				} = choices.onboarding.businessInfo;
				this.props.addWidget(
					siteId,
					{
						id_base: 'widget_contact_info',
						settings: {
							title: businessName,
							address: [ businessAddress, businessCity, businessState, businessZipCode ].join( '\n' ),
						}
					}
				).then( () => this.setState( { widgetsReady: 'yes' } ) );
			} else {
				this.setState( { widgetsReady: 'yes' } );
			}
		}
	}

	render() {
		const headerText = translate( 'Congratulations! %s is ready.', {
			args: get( this.props.signupDependencies, [ 'jpoSiteTitle', 'siteTitle' ], false ) || translate( 'your new site' )
		} );
		const subHeaderText = translate(
			'You have unlocked dozens of website-bolstering features with Jetpack. Continue preparing your site below.'
		);
		let stepContent = translate( 'Getting everything ready…' );
		if ( 'yes' === this.state.pluginsReady && 'yes' === this.state.settingsReady && 'yes' === this.state.widgetsReady ) {
			stepContent = this.renderStepContent();
		}

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
					signupProgress={ this.props.signupProgress }
					stepContent={ stepContent }
					shouldHideNavButtons={ true }
				/>
			</div>
		);
	}
}

export default connect(
	null,
	{
		setJPOSummary,
		updateSettings,
		installPlugin,
		addWidget,
	}
)( JPOSummaryStep );
