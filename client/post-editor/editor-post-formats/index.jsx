/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { map } from 'lodash';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import FormRadio from 'components/forms/form-radio';
import QueryPostFormats from 'components/data/query-post-formats';
import PostActions from 'lib/posts/actions';
import { recordStat, recordEvent } from 'lib/posts/stats';
import AccordionSection from 'components/accordion/section';
import EditorThemeHelp from 'post-editor/editor-theme-help';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getPostFormats } from 'state/post-formats/selectors';

const EditorPostFormats = React.createClass( {
	propTypes: {
		siteId: PropTypes.number,
		value: PropTypes.string,
		postFormats: PropTypes.object
	},

	getDefaultProps() {
		return {
			value: 'standard'
		};
	},

	getSelectedPostFormat() {
		const { value } = this.props;
		const isSupportedFormat = !! this.getPostFormats()[ value ];

		return isSupportedFormat ? value : 'standard';
	},

	getPostFormats() {
		let formats = {
			standard: this.translate( 'Standard', {
				context: 'Post format'
			} )
		};

		if ( this.props.postFormats ) {
			formats = Object.assign( formats, this.props.postFormats );
		}

		return formats;
	},

	getPostFormatIcon( postFormatSlug ) {
		const icons = {
			aside: 'aside',
			image: 'image',
			video: 'video-camera',
			quote: 'quote',
			link: 'link',
			gallery: 'image-multiple',
			status: 'pencil',
			audio: 'audio',
			chat: 'comment'
		};

		return icons[ postFormatSlug ] ? icons[ postFormatSlug ] : 'posts';
	},

	onChange( event ) {
		// TODO: REDUX - remove flux actions when whole post-editor is reduxified
		PostActions.edit( {
			format: event.target.value
		} );

		recordStat( 'post_format_changed' );
		recordEvent( 'Changed Post Format', event.target.value );
	},

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
							<span className={ 'editor-post-formats__format-icon' } >
								<Gridicon icon={ this.getPostFormatIcon( postFormatSlug ) } size={ 18 } />
							</span>
							{ postFormatLabel }
						</span>
					</label>
				</li>
			);
		} );
	},

	render() {
		return (
			<AccordionSection>
				<EditorThemeHelp className="editor-post-formats__help-link" />
				<QueryPostFormats siteId={ this.props.siteId } />
				<ul className="editor-post-formats">
					{ this.renderPostFormats() }
				</ul>
			</AccordionSection>
		);
	}
} );

export default connect(
	( state ) => {
		const siteId = getSelectedSiteId( state );

		return {
			siteId,
			postFormats: getPostFormats( state, siteId )
		};
	}
)( EditorPostFormats );
