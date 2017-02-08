/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import page from 'page';

/**
 * Internal dependencies
 */
import DocumentHead from 'components/data/document-head';
import HeaderCake from 'components/header-cake';
import { getSelectedSite } from 'state/ui/selectors';

export const DateTimeFormat = ( { translate, site } ) => {
	const goBack = () => {
		page( '/settings/general/' + site.slug );
	};

	return (
		<div className="main main-column date-time-format" role="main">
			<DocumentHead title={ translate( 'Manage Date and Time Format Configurations' ) } />
			<HeaderCake onClick={ goBack }>
				<h1>
					{ translate( 'Date and Time Format' ) }
				</h1>
			</HeaderCake>
		</div>
	);
};

const mapStateToProps = state => ( {
	site: getSelectedSite( state ),
} );

export default connect( mapStateToProps )( localize( DateTimeFormat ) );
