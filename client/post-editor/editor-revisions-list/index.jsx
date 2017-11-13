/** @format */

/**
 * External dependencies
 */

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { head, map } from 'lodash';

/**
 * Internal dependencies
 */
import EditorRevisionsListHeader from './header';
import EditorRevisionsListItem from './item';
import { getPostRevisionsSelectedRevisionId } from 'state/selectors';
import { selectPostRevision } from 'state/posts/revisions/actions';

class EditorRevisionsList extends PureComponent {
	static propTypes = {
		postId: PropTypes.number,
		revisions: PropTypes.array.isRequired,
		selectedRevisionId: PropTypes.number,
	};

	trySelectingFirstRevision = () => {
		const { revisions } = this.props;
		if ( ! revisions.length ) {
			return;
		}
		const firstRevision = head( revisions );
		if ( ! firstRevision.id ) {
			return;
		}
		this.props.selectPostRevision( firstRevision.id );
	};

	componentWillMount() {
		this.trySelectingFirstRevision();
	}

	componentDidMount() {
		// Make sure that scroll position in the editor is not preserved.
		window.scrollTo( 0, 0 );
	}

	componentWillUpdate() {
		this.trySelectingFirstRevision();
	}

	render() {
		const { revisions, selectedRevisionId } = this.props;
		return (
			<div className="editor-revisions-list">
				<EditorRevisionsListHeader numRevisions={ revisions.length } />
				<div className="editor-revisions-list__scroller">
					<ul className="editor-revisions-list__list">
						{ map( revisions, revision => {
							const itemClasses = classNames( 'editor-revisions-list__revision', {
								'is-selected': revision.id === selectedRevisionId,
							} );
							return (
								<li className={ itemClasses } key={ revision.id }>
									<EditorRevisionsListItem revision={ revision } />
								</li>
							);
						} ) }
					</ul>
				</div>
			</div>
		);
	}
}

export default connect(
	state => ( {
		selectedRevisionId: getPostRevisionsSelectedRevisionId( state ),
	} ),
	{ selectPostRevision }
)( EditorRevisionsList );
