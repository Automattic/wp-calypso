import { Component } from 'react';
import { connect } from 'react-redux';
import { savePreference } from 'calypso/state/preferences/actions';
import { READER_AS_LANDING_PAGE_PREFERENCE } from 'calypso/state/sites/selectors/has-reader-as-landing-page';

class SetReaderLanding extends Component {
	componentDidMount() {
		const { submitSignupStep, saveReaderPreference } = this.props;

		saveReaderPreference();
		submitSignupStep( { stepName: 'set-reader-landing' } );
		this.props.goToNextStep();
	}

	render() {
		return null; // Non-interactive step
	}
}

export default connect( null, {
	saveReaderPreference: () =>
		savePreference( READER_AS_LANDING_PAGE_PREFERENCE, {
			useReaderAsLandingPage: true,
			updatedAt: Date.now(),
		} ),
} )( SetReaderLanding );
