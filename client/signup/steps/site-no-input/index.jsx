import page from 'page';
import { Component } from 'react';
import { connect } from 'react-redux';
import { getCurrentUserSiteCount } from 'calypso/state/current-user/selectors';
import { submitSignupStep } from 'calypso/state/signup/progress/actions';

class SiteNoInputComponent extends Component {
	componentDidMount() {
		const { userSiteCount, flowName, stepName } = this.props;
		if ( userSiteCount && userSiteCount > 0 ) {
			page.redirect( `/post?showLaunchpad=true` );
			return;
		}

		this.props.submitSignupStep( { stepName } );
		this.props.goToNextStep( flowName );
	}

	render() {
		return null;
	}
}

export default connect(
	( state ) => ( {
		userSiteCount: getCurrentUserSiteCount( state ),
	} ),
	{ submitSignupStep }
)( SiteNoInputComponent );
