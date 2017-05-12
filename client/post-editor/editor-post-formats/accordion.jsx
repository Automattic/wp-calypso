/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { has, isEmpty } from 'lodash';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import Accordion from 'components/accordion';
import QueryPostFormats from 'components/data/query-post-formats';
import PostFormats from './';
import { getSelectedSiteId, getSelectedSite } from 'state/ui/selectors';
import { getPostFormats } from 'state/post-formats/selectors';
import { getSiteDefaultPostFormat } from 'state/selectors';

const EditorPostFormatsAccordion = React.createClass( {
	propTypes: {
		siteId: PropTypes.number,
		site: PropTypes.object,
		post: PropTypes.object,
		postFormats: PropTypes.object,
		defaultPostFormat: PropTypes.string,
	},

	getFormatValue() {
		const { post, defaultPostFormat } = this.props;
		if ( ! post ) {
			return;
		}

		if ( post.format ) {
			return post.format;
		}

		return defaultPostFormat;
	},

	getSubtitle() {
		const formatValue = this.getFormatValue();
		const { post, postFormats } = this.props;

		if ( ! post || ! postFormats ) {
			return;
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
			<div>
				<QueryPostFormats siteId={ this.props.siteId } />
				{ ! isEmpty( postFormats ) && (
					<Accordion
						title={ this.translate( 'Post Format' ) }
						subtitle={ this.getSubtitle() }
						className={ classes }>
						<PostFormats value={ this.getFormatValue() } />
					</Accordion>
				) }
			</div>
		);
	}
} );

export default connect(
	( state ) => {
		const siteId = getSelectedSiteId( state );

		return {
			siteId,
			site: getSelectedSite( state ),
			postFormats: getPostFormats( state, siteId ),
			defaultPostFormat: getSiteDefaultPostFormat( state, siteId ),
		};
	}
)( EditorPostFormatsAccordion );
