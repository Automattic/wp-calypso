/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import React from 'react';
import { connect } from 'react-redux';
import { get, map } from 'lodash';
import Gridicon from 'components/gridicon';

/**
 * Internal dependencies
 */
import FormRadio from 'components/forms/form-radio';
import QueryPostFormats from 'components/data/query-post-formats';
import { recordEditorStat, recordEditorEvent } from 'state/posts/stats';
import AccordionSection from 'components/accordion/section';
import EditorThemeHelp from 'post-editor/editor-theme-help';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getPostFormats } from 'state/post-formats/selectors';
import { getEditorPostId } from 'state/ui/editor/selectors';
import { getEditedPostValue } from 'state/posts/selectors';
import getSiteDefaultPostFormat from 'state/selectors/get-site-default-post-format';
import { editPost } from 'state/posts/actions';

/**
 * Style dependencies
 */
import './style.scss';

const ICONS = {
	aside: 'aside',
	image: 'image',
	video: 'video-camera',
	quote: 'quote',
	link: 'link',
	gallery: 'image-multiple',
	status: 'pencil',
	audio: 'audio',
	chat: 'comment',
};

function getPostFormatIcon( postFormatSlug ) {
	return get( ICONS, [ postFormatSlug ], 'posts' );
}

class EditorPostFormats extends React.Component {
	static propTypes = {
		siteId: PropTypes.number,
		postId: PropTypes.number,
		postFormats: PropTypes.object,
		formatValue: PropTypes.string,
	};

	getSelectedPostFormat() {
		const { formatValue } = this.props;
		const isSupportedFormat = !! this.getPostFormats()[ formatValue ];

		return isSupportedFormat ? formatValue : 'standard';
	}

	getPostFormats() {
		let formats = {
			standard: this.props.translate( 'Standard', {
				context: 'Post format',
			} ),
		};

		if ( this.props.postFormats ) {
			formats = Object.assign( formats, this.props.postFormats );
		}

		return formats;
	}

	onChange = ( event ) => {
		const format = event.target.value;

		this.props.editPost( this.props.siteId, this.props.postId, { format } );
		this.props.recordEditorStat( 'post_format_changed' );
		this.props.recordEditorEvent( 'Changed Post Format', format );
	};

	renderPostFormats() {
		const selectedFormat = this.getSelectedPostFormat();

		return map( this.getPostFormats(), ( postFormatLabel, postFormatSlug ) => {
			return (
				<li key={ postFormatSlug } className="editor-post-formats__format">
					<label>
						<FormRadio
							name="format"
							value={ postFormatSlug }
							checked={ postFormatSlug === selectedFormat }
							onChange={ this.onChange }
						/>
						<span className="editor-post-formats__format-label">
							<span className={ 'editor-post-formats__format-icon' }>
								<Gridicon icon={ getPostFormatIcon( postFormatSlug ) } size={ 18 } />
							</span>
							{ postFormatLabel }
						</span>
					</label>
				</li>
			);
		} );
	}

	render() {
		return (
			<AccordionSection>
				<EditorThemeHelp className="editor-post-formats__help-link" />
				<QueryPostFormats siteId={ this.props.siteId } />
				<ul className="editor-post-formats">{ this.renderPostFormats() }</ul>
			</AccordionSection>
		);
	}
}

export default connect(
	( state ) => {
		const siteId = getSelectedSiteId( state );
		const postId = getEditorPostId( state );
		const postFormats = getPostFormats( state, siteId );
		const formatValue =
			getEditedPostValue( state, siteId, postId, 'format' ) ||
			getSiteDefaultPostFormat( state, siteId );

		return { siteId, postId, postFormats, formatValue };
	},
	{ editPost, recordEditorStat, recordEditorEvent }
)( localize( EditorPostFormats ) );
