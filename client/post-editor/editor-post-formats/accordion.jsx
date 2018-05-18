/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { get, has, isEmpty } from 'lodash';
import classNames from 'classnames';

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
import { getEditedPost } from 'state/posts/selectors';

class EditorPostFormatsAccordion extends Component {
	static propTypes = {
		siteId: PropTypes.number,
		isLoading: PropTypes.bool,
		postFormats: PropTypes.object,
		formatValue: PropTypes.string,
	};

	getSubtitle() {
		const { isLoading, postFormats, formatValue } = this.props;

		if ( isLoading ) {
			return;
		}

		if ( has( postFormats, formatValue ) ) {
			return postFormats[ formatValue ];
		}

		return this.props.translate( 'Standard', {
			context: 'Post format',
		} );
	}

	render() {
		const { className, isLoading, siteId, postFormats } = this.props;
		const classes = classNames( 'editor-post-formats__accordion', className, {
			'is-loading': isLoading,
		} );

		return (
			<Fragment>
				<QueryPostFormats siteId={ siteId } />
				{ ! isEmpty( postFormats ) && (
					<Accordion
						title={ this.props.translate( 'Post Format' ) }
						subtitle={ this.getSubtitle() }
						className={ classes }
						e2eTitle="post-format"
					>
						<EditorPostFormats />
					</Accordion>
				) }
			</Fragment>
		);
	}
}

export default connect( state => {
	const siteId = getSelectedSiteId( state );
	const postId = getEditorPostId( state );
	const post = getEditedPost( state, siteId, postId );
	const postFormats = getPostFormats( state, siteId );
	const isLoading = ! ( post && postFormats );
	const formatValue = get( post, 'format' ) || getSiteDefaultPostFormat( state, siteId );

	return { siteId, isLoading, postFormats, formatValue };
} )( localize( EditorPostFormatsAccordion ) );
