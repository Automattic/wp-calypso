import { localize, fixMe } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import EmptyContent from 'calypso/components/empty-content';
import LoggedOutFormLinks from 'calypso/components/logged-out-form/links';
import Main from 'calypso/components/main';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import HelpButton from './help-button';

class NoDirectAccessError extends PureComponent {
	static propTypes = {
		recordTracksEvent: PropTypes.func.isRequired,
		translate: PropTypes.func.isRequired,
	};

	render() {
		const { translate } = this.props;

		return (
			<Main className="jetpack-connect__main-error">
				<EmptyContent
					title={ fixMe( {
						text: 'This URL should not be accessed directly',
						newCopy: translate( 'This URL should not be accessed directly' ),
						oldCopy: translate( 'Oops, this URL should not be accessed directly' ),
					} ) }
					action={ translate( 'Get back to Jetpack Connect screen' ) }
					actionURL="/jetpack/connect"
				/>
				<LoggedOutFormLinks>
					<HelpButton />
				</LoggedOutFormLinks>
			</Main>
		);
	}
}

export default connect( null, { recordTracksEvent } )( localize( NoDirectAccessError ) );
