/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import { flowRight } from 'lodash';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import SectionHeader from 'components/section-header';
import { getEditorPath } from 'state/ui/editor/selectors';

class PostCard extends Component {

	static propTypes = {
		editorPath: PropTypes.string.isRequired,
		post: PropTypes.shape( {
			title: PropTypes.string.isRequired,
			url: PropTypes.string.isRequired,
		} ).isRequired,
		remove: PropTypes.func.isRequired,
	};

	handleMouseDown = ( event ) => {
		event.stopPropagation();
		event.preventDefault();
	}

	render() {
		const {
			editorPath,
			post: { url, title },
			remove,
			translate,
		} = this.props;

		const postCardClass = 'zoninator__zone-list-item';

		return (
			<SectionHeader label={ title } className={ postCardClass }>
				<Button
					compact
					onMouseDown={ this.handleMouseDown }
					href={ url }
					target="_blank">
					{ translate( 'View' ) }
				</Button>
				<Button
					compact
					onMouseDown={ this.handleMouseDown }
					href={ editorPath }>
					{ translate( 'Edit' ) }
				</Button>
				<Button
					compact
					scary
					onMouseDown={ this.handleMouseDown }
					onClick={ remove }>
					{ translate( 'Remove' ) }
				</Button>
			</SectionHeader>
		);
	}
}

const connectComponent = connect( ( state, { post } ) => ( {
	editorPath: getEditorPath( state, post.siteId, post.id ),
} ) );

export default flowRight(
	connectComponent,
	localize,
)( PostCard );
