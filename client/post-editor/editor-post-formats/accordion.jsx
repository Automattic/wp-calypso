/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { has } from 'lodash';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import Accordion from 'components/accordion';
import Gridicon from 'components/gridicon';
import QueryPostFormats from 'components/data/query-post-formats';
import siteUtils from 'lib/site/utils';
import PostFormats from './';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getPostFormats } from 'state/post-formats/selectors';

const EditorPostFormatsAccordion = React.createClass( {
	displayName: 'EditorPostFormatsAccordion',

	propTypes: {
		site: PropTypes.object,
		post: PropTypes.object,
		postFormats: PropTypes.object
	},

	getFormatValue() {
		const { post, site } = this.props;
		if ( ! post ) {
			return;
		}

		if ( post.format ) {
			return post.format;
		}

		return siteUtils.getDefaultPostFormat( site );
	},

	getSubtitle() {
		const formatValue = this.getFormatValue();
		const { post, postFormats } = this.props;

		if ( ! post || ! postFormats ) {
			return null;
		}

		if ( has( postFormats, formatValue ) ) {
			return postFormats[ formatValue ];
		}

		return this.translate( 'Standard', {
			context: 'Post format'
		} );
	},

	render() {
		const { className, post, postFormats } = this.props;
		const classes = classNames( 'editor-post-formats__accordion', className, {
			'is-loading': ! post || ! postFormats
		} );

		return (
			<Accordion
				title={ this.translate( 'Post Format' ) }
				subtitle={ this.getSubtitle() }
				icon={ <Gridicon icon="types" /> }
				className={ classes }>
				<QueryPostFormats siteId={ this.props.site.ID } />
				<PostFormats
					site={ this.props.site }
					post={ post }
					value={ this.getFormatValue() }
				/>
			</Accordion>
		);
	}
} );

export default connect(
	( state ) => {
		const siteId = getSelectedSiteId( state );

		return {
			postFormats: getPostFormats( state, siteId )
		};
	}
)( EditorPostFormatsAccordion );
