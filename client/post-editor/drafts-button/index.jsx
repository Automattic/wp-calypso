/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import get from 'lodash/get';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Count from 'components/count';
import { getSelectedSite } from 'state/ui/selectors';
import { translate } from 'lib/mixins/i18n';

function EditorDraftsButton( { count, onClick, jetpack } ) {
	return (
		<Button
			compact borderless
			className="drafts-button"
			onClick={ onClick }
			disabled={ ! count && ! jetpack }
			aria-label={ translate( 'View all drafts' ) }
		>
			<span>{ translate( 'Drafts' ) }</span>
			{ count && ! jetpack ? <Count count={ count } /> : null }
		</Button>
	);
};

EditorDraftsButton.propTypes = {
	count: PropTypes.number,
	onClick: PropTypes.func,
	jetpack: PropTypes.bool
};

export default connect( ( state ) => {
	const jetpack = get( getSelectedSite( state ), 'jetpack' );

	return { jetpack };
} )( EditorDraftsButton );
