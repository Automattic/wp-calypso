/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import React from 'react';
import { flow } from 'lodash';
import { connect } from 'react-redux';
import page from 'page';

/**
 * Internal dependencies
 */
import ImporterActionButton from './action-button';
import { resetImport } from 'lib/importer/actions';
import { recordTracksEvent } from 'state/analytics/actions';
import {
	clearImportingFromSignupFlow,
	setImportOriginSiteDetails,
} from 'state/importer-nux/actions';
import { isImportingFromSignupFlow } from 'state/importer-nux/temp-selectors';
import { getSelectedSiteSlug } from 'state/ui/selectors';

export class DoneButton extends React.PureComponent {
	static displayName = 'DoneButton';

	static propTypes = {
		importerStatus: PropTypes.shape( {
			importerId: PropTypes.string.isRequired,
			type: PropTypes.string.isRequired,
		} ),
		site: PropTypes.shape( {
			ID: PropTypes.number.isRequired,
		} ),
	};

	handleClick = () => {
		const {
			importerStatus: { type },
			site: { ID: siteId },
			isSignup,
			siteSlug,
		} = this.props;

		this.props.recordTracksEvent( 'calypso_importer_main_done_clicked', {
			blog_id: siteId,
			importer_id: type,
		} );

		const destination = '/view/' + ( siteSlug || '' );
		page( isSignup ? `${ destination }?welcome` : destination );
	};

	componentWillUnmount() {
		const {
			importerStatus: { importerId },
			site: { ID: siteId },
			isSignup,
		} = this.props;

		/**
		 * Calling `resetImport` in unmount defers until the redirect is in progress
		 * Otherwise, you see the importers list during the route change
		 */
		resetImport( siteId, importerId );

		if ( isSignup ) {
			this.props.clearImportingFromSignupFlow();
		}
	}

	render() {
		const { translate } = this.props;

		return (
			<ImporterActionButton primary onClick={ this.handleClick }>
				{ translate( 'View site' ) }
			</ImporterActionButton>
		);
	}
}

export default flow(
	connect(
		( state ) => ( {
			isSignup: isImportingFromSignupFlow( state ),
			siteSlug: getSelectedSiteSlug( state ),
		} ),
		{ clearImportingFromSignupFlow, setImportOriginSiteDetails, recordTracksEvent }
	),
	localize
)( DoneButton );
