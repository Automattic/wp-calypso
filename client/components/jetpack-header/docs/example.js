/**
 * External dependencies
 */
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import JetpackHeader from '..';
import { getPreference } from 'state/preferences/selectors';

class JetpackHeaderExample extends PureComponent {
	static defaultProps = {
		exampleCode: (
			<div>
				<JetpackHeader />
				<JetpackHeader partnerSlug="dreamhost" />
				<JetpackHeader partnerSlug="pressable" />
				<JetpackHeader partnerSlug="milesweb" />
				<JetpackHeader partnerSlug="bluehost" />
				<JetpackHeader partnerSlug="inmotion" />
				<JetpackHeader partnerSlug="liquidweb" />
			</div>
		),
	};

	render() {
		const darkColorScheme = this.props.colorSchemePreference === 'laser-black';

		return (
			<div>
				<JetpackHeader />
				<JetpackHeader partnerSlug="dreamhost" darkColorScheme={ darkColorScheme } />
				<JetpackHeader partnerSlug="pressable" darkColorScheme={ darkColorScheme } />
				<JetpackHeader partnerSlug="milesweb" darkColorScheme={ darkColorScheme } />
				<JetpackHeader partnerSlug="bluehost" darkColorScheme={ darkColorScheme } />
				<JetpackHeader partnerSlug="inmotion" darkColorScheme={ darkColorScheme } />
				<JetpackHeader partnerSlug="liquidweb" darkColorScheme={ darkColorScheme } />
			</div>
		);
	}
}

const ConnectedJetpackHeaderExample = connect( state => ( {
	colorSchemePreference: getPreference( state, 'colorScheme' ),
} ) )( JetpackHeaderExample );

ConnectedJetpackHeaderExample.displayName = 'JetpackHeaderExample';

export default ConnectedJetpackHeaderExample;
