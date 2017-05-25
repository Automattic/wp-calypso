/**
 * External dependencies
 */
import React from 'react';
import PureRenderMixin from 'react-pure-render/mixin';

/**
 * Internal dependencies
 */
import WizardBar from 'components/wizard-bar';

module.exports = React.createClass( {
	displayName: 'WizardBar',

	mixins: [ PureRenderMixin ],

	render() {
		return (
			<div>
				<WizardBar value={ 0 } />
				<WizardBar value={ 55 } total={ 100 } />
				<WizardBar value={ 100 } color="#1BABDA" />
			</div>
		);
	}
} );
