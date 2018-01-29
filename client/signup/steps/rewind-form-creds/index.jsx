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

class RewindFormCreds extends Component {
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
			<Card className="rewind-form-creds__card rewind-switch__card rewind-switch__content">
				<h3 className="rewind-form-creds__title rewind-switch__heading">
					{ translate( 'Site credentials' ) }
				</h3>
				<p className="rewind-form-creds__description rewind-switch__description">
					{ translate(
						"We'll guide you through the process of finding and entering your site's credentials."
					) }
				</p>
				<Button primary href={ `/stats/activity/${ siteSlug }` }>
					{ translate( 'Creds form should be here' ) }
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

export default connect(
	( state, ownProps ) => ( {
		siteSlug: get( ownProps, [ 'initialContext', 'query', 'siteSlug' ], 0 ),
	} ),
	null
)( localize( RewindFormCreds ) );
