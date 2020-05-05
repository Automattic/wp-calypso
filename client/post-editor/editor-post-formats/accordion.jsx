/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { has, isEmpty } from 'lodash';

/**
 * Internal dependencies
 */
import Accordion from 'components/accordion';
import QueryPostFormats from 'components/data/query-post-formats';
import EditorPostFormats from './';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getPostFormats } from 'state/post-formats/selectors';
import getSiteDefaultPostFormat from 'state/selectors/get-site-default-post-format';
import { getEditorPostId } from 'state/ui/editor/selectors';
import { getEditedPostValue } from 'state/posts/selectors';

class EditorPostFormatsAccordion extends Component {
	static propTypes = {
		siteId: PropTypes.number,
		isLoading: PropTypes.bool,
		postFormats: PropTypes.object,
		formatValue: PropTypes.string,
	};

	getSubtitle() {
		const { postFormats, formatValue } = this.props;

		if ( has( postFormats, formatValue ) ) {
			return postFormats[ formatValue ];
		}

		return this.props.translate( 'Standard', {
			context: 'Post format',
		} );
	}

	render() {
		const { siteId, postFormats } = this.props;

		return (
			<Fragment>
				{ siteId && <QueryPostFormats siteId={ siteId } /> }
				{ ! isEmpty( postFormats ) && (
					<Accordion
						title={ this.props.translate( 'Post Format' ) }
						subtitle={ this.getSubtitle() }
						className="editor-drawer__accordion editor-post-formats__accordion"
						e2eTitle="post-format"
					>
						<EditorPostFormats />
					</Accordion>
				) }
			</Fragment>
		);
	}
}

export default connect( ( state ) => {
	const siteId = getSelectedSiteId( state );
	const postId = getEditorPostId( state );
	const postFormats = getPostFormats( state, siteId );
	const formatValue =
		getEditedPostValue( state, siteId, postId, 'format' ) ||
		getSiteDefaultPostFormat( state, siteId );

	return { siteId, postFormats, formatValue };
} )( localize( EditorPostFormatsAccordion ) );
