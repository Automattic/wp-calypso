/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { Steps } from './constants';
import Confirmation from './confirmation';
import DocumentHead from 'components/data/document-head';
import Intro from './intro';
import Main from 'components/main';
import PageSetup from './page-setup';
import Wizard from 'components/wizard';
import { getSelectedSiteSlug } from 'state/ui/selectors';

const SetupWizard = ( {
	slug,
	stepName = Steps.INTRO,
	translate,
} ) => {
	const steps = [ Steps.INTRO, Steps.PAGE_SETUP, Steps.CONFIRMATION ];
	const components = {
		[ Steps.INTRO ]: <Intro />,
		[ Steps.PAGE_SETUP ]: <PageSetup />,
		[ Steps.CONFIRMATION ]: <Confirmation />,
	};
	const mainClassName = 'wp-job-manager__setup';

	return (
		<Main className={ mainClassName }>
			<DocumentHead title={ translate( 'Setup' ) } />
			<Wizard
				basePath={ `/extensions/wp-job-manager/setup/${ slug }` }
				components={ components }
				forwardText={ translate( 'Continue' ) }
				steps={ steps }
				stepName={ stepName } />
		</Main>
	);
};

const mapStateToProps = state => ( {
	slug: getSelectedSiteSlug( state ),
} );

SetupWizard.propTypes = {
	slug: PropTypes.string,
	stepName: PropTypes.string,
	translate: PropTypes.func.isRequired,
};

export default connect( mapStateToProps )( localize( SetupWizard ) );
