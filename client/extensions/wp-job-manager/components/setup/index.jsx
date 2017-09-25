/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Confirmation from './confirmation';
import { SetupPath, Steps } from './constants';
import Intro from './intro';
import PageSetup from './page-setup';
import DocumentHead from 'components/data/document-head';
import Main from 'components/main';
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
				basePath={ `${ SetupPath }/${ slug }` }
				components={ components }
				forwardText={ translate( 'Continue' ) }
				hideNavigation={ true }
				steps={ steps }
				stepName={ stepName } />
		</Main>
	);
};

const mapStateToProps = state => ( { slug: getSelectedSiteSlug( state ) } );

SetupWizard.propTypes = {
	slug: PropTypes.string,
	stepName: PropTypes.string,
	translate: PropTypes.func.isRequired,
};

export default connect( mapStateToProps )( localize( SetupWizard ) );
