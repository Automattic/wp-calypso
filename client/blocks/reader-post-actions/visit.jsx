/**
 * External Dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import ExternalLink from 'components/external-link';

const ReaderPostActionsVisitLink = ( { visitUrl, iconSize, onClick, translate } ) => {
	return (
		<ExternalLink href={ visitUrl }
			target="_blank"
			icon={ true }
			showIconFirst={ true }
			iconSize={ iconSize }
			onClick={ onClick }>
			<span className="reader-post-actions__visit-label">
				{ translate( 'Visit' ) }
			</span>
		</ExternalLink>
	);
};

ReaderPostActionsVisitLink.propTypes = {
	visitUrl: React.PropTypes.string.isRequired,
	iconSize: React.PropTypes.number,
	onClick: React.PropTypes.func,
};

ReaderPostActionsVisitLink.defaultProps = {
	iconSize: 24,
};

export default localize( ReaderPostActionsVisitLink );
