/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { has, isEmpty } from 'lodash';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import Accordion from 'components/accordion';
import Gridicon from 'components/gridicon';
import siteUtils from 'lib/site/utils';
import PostFormats from './';

export default React.createClass( {
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
			return this.translate( 'Loading…' );
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

		if ( isEmpty( postFormats ) ) {
			return null;
		}

		return (
			<Accordion
				title={ this.translate( 'Post Format' ) }
				subtitle={ this.getSubtitle() }
				icon={ <Gridicon icon="types" /> }
				className={ classes }>
				<PostFormats
					post={ post }
					postFormats={ postFormats }
					value={ this.getFormatValue() }
				/>
			</Accordion>
		);
	}
} );
