import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';

const EditorRevisionsListHeader = ( { numRevisions, translate } ) => {
	return (
		<div className="editor-revisions-list__header">
			<span className="editor-revisions-list__count">
				{ !! numRevisions &&
					translate( '%(revisions)d revision', '%(revisions)d revisions', {
						count: numRevisions,
						args: { revisions: numRevisions },
					} ) }
			</span>
		</div>
	);
};

EditorRevisionsListHeader.propTypes = {
	numRevisions: PropTypes.number.isRequired,

	// localize
	translate: PropTypes.func.isRequired,
};

export default localize( EditorRevisionsListHeader );
