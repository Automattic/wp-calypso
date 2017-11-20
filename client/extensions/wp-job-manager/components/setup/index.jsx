/** @format */

/**
 * External dependencies
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { MinPluginVersion, SetupPath, Steps } from '../../constants';
import Confirmation from './confirmation';
import DocumentHead from 'components/data/document-head';
import ExtensionRedirect from 'blocks/extension-redirect';
import Intro from './intro';
import Main from 'components/main';
import PageSetup from './page-setup';
import Wizard from 'components/wizard';
import { getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';
import { saveSetupStatus } from '../../state/setup/actions';

class SetupWizard extends Component {
	static propTypes = {
		saveSetupStatus: PropTypes.func.isRequired,
		siteId: PropTypes.number,
		slug: PropTypes.string,
		stepName: PropTypes.string,
		translate: PropTypes.func.isRequired,
	};

	static defaultProps = {
		stepName: Steps.INTRO,
	};

	componentDidMount() {
		const { siteId } = this.props;

		if ( ! siteId ) {
			return;
		}

		// When the user visits the setup wizard, let's make sure they never see it again.
		this.props.saveSetupStatus( siteId, false );
	}

	componentWillReceiveProps( { siteId } ) {
		if ( ! siteId || this.props.siteId === siteId ) {
			return;
		}

		// When the user visits the setup wizard, let's make sure they never see it again.
		this.props.saveSetupStatus( siteId, false );
	}

	render() {
		const { siteId, slug, stepName, translate } = this.props;
		const steps = [ Steps.INTRO, Steps.PAGE_SETUP, Steps.CONFIRMATION ];
		const components = {
			[ Steps.INTRO ]: <Intro />,
			[ Steps.PAGE_SETUP ]: <PageSetup />,
			[ Steps.CONFIRMATION ]: <Confirmation />,
		};
		const mainClassName = 'wp-job-manager__setup';

		return (
			<Main className={ mainClassName }>
				<ExtensionRedirect
					minimumVersion={ MinPluginVersion }
					pluginId="wp-job-manager"
					siteId={ siteId }
				/>
				<DocumentHead title={ translate( 'Setup' ) } />
				<Wizard
					basePath={ `${ SetupPath }/${ slug }` }
					components={ components }
					forwardText={ translate( 'Continue' ) }
					hideNavigation={ true }
					steps={ steps }
					stepName={ stepName }
				/>
			</Main>
		);
	}
}

const mapStateToProps = state => ( {
	siteId: getSelectedSiteId( state ),
	slug: getSelectedSiteSlug( state ),
} );

const mapDispatchToProps = { saveSetupStatus };

export default connect( mapStateToProps, mapDispatchToProps )( localize( SetupWizard ) );
