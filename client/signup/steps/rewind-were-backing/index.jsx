/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import StepWrapper from 'signup/step-wrapper';
import Card from 'components/card';
import Button from 'components/button';
import { getSelectedSiteSlug } from 'state/ui/selectors';

class RewindWereBacking extends Component {
	static propTypes = {
		flowName: PropTypes.string,
		goToNextStep: PropTypes.func.isRequired,
		positionInFlow: PropTypes.number,
		signupProgress: PropTypes.array,
		stepName: PropTypes.string,

		// Connected props
		siteSlug: PropTypes.string.isRequired,
	};

	stepContent = () => {
		const { translate, siteSlug } = this.props;

		return (
			<Card className="rewind-were-backing__card">
				<h3 className="rewind-were-backing__title">
					{ translate( "We're backing up your site!" ) }
				</h3>
				<img src="/calypso/images/illustrations/thankYou.svg" alt="" />
				<p className="rewind-were-backing__description">
					{ translate(
						'Welcome to your Jetpack Premium plan! ' +
							"That sound you're hearing? It's your website doing backflips with excitement!"
					) }
				</p>
				<Button primary href={ `/stats/activity/${ siteSlug }` }>
					{ translate( 'View your activity' ) }
				</Button>
			</Card>
		);
	};

	render() {
		return (
			<StepWrapper
				flowName={ this.props.flowName }
				stepName={ this.props.stepName }
				positionInFlow={ this.props.positionInFlow }
				signupProgress={ this.props.signupProgress }
				stepContent={ this.stepContent() }
				hideFormattedHeader={ true }
				hideSkip={ true }
				hideBack={ true }
			/>
		);
	}
}

export default connect( ( state, ownProps ) => {
	return {
		siteSlug: getSelectedSiteSlug(
			state,
			get( ownProps, [ 'initialContext', 'query', 'blogid' ], 0 )
		),
	};
}, null )( localize( RewindWereBacking ) );
