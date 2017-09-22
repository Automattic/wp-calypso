/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import { find, size, map } from 'lodash';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import AccordionSection from 'components/accordion/section';
import QueryPageTemplates from 'components/data/query-page-templates';
import SelectDropdown from 'components/select-dropdown';
import DropdownItem from 'components/select-dropdown/item';
import EditorDrawerLabel from 'post-editor/editor-drawer/label';
import EditorThemeHelp from 'post-editor/editor-theme-help';
import { getPageTemplates } from 'state/page-templates/selectors';
import { editPost } from 'state/posts/actions';
import { getEditedPostValue } from 'state/posts/selectors';
import { getSiteOption } from 'state/sites/selectors';
import { getEditorPostId } from 'state/ui/editor/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';

class EditorPageTemplates extends Component {
	static propTypes = {
		siteId: PropTypes.number,
		postId: PropTypes.number,
		postType: PropTypes.string,
		template: PropTypes.string,
		templates: PropTypes.array,
		editPost: PropTypes.func,
		pageForPostsId: PropTypes.number,
	};

	constructor() {
		super( ...arguments );

		this.selectTemplate = this.selectTemplate.bind( this );
	}

	selectTemplate( file ) {
		const { siteId, postId } = this.props;
		this.props.editPost( siteId, postId, { page_template: file } );
	}

	getSelectedTemplateText() {
		const { templates, template, translate } = this.props;

		let selectedTemplate;
		if ( template ) {
			selectedTemplate = find( templates, { file: template } );
		}

		if ( selectedTemplate ) {
			return selectedTemplate.label;
		}

		return translate( 'Default Template' );
	}

	getTemplates() {
		const { translate, templates } = this.props;
		return [ {
			label: translate( 'Default Template' ),
			file: ''
		} ].concat( templates || [] );
	}

	render() {
		const { postType, template, siteId, translate, postId, pageForPostsId } = this.props;
		if ( 'page' !== postType || postId === pageForPostsId ) {
			return null;
		}

		const templates = this.getTemplates();
		return (
			<div>
				{ siteId && <QueryPageTemplates siteId={ siteId } /> }
				{ size( templates ) > 1 && (
					<AccordionSection>
						<EditorDrawerLabel labelText={ translate( 'Page Template' ) }>
							<EditorThemeHelp className="editor-page-templates__help-link" />
							<SelectDropdown selectedText={ this.getSelectedTemplateText() }>
								{ map( templates, ( { file, label } ) => (
									/* eslint-disable react/jsx-no-bind */
									// jsx-no-bind disabled because while it's possible
									// to extract this out into a separate component
									// with its own click handler, that would severely
									// harm the readability of this component.
									<DropdownItem
										key={ file }
										selected={ file === template }
										onClick={ () => this.selectTemplate( file ) }>
										{ label }
									</DropdownItem>
								) ) }
							</SelectDropdown>
						</EditorDrawerLabel>
					</AccordionSection>
				) }
			</div>
		);
	}
}

export default connect(
	( state ) => {
		const siteId = getSelectedSiteId( state );
		const postId = getEditorPostId( state );
		const postType = getEditedPostValue( state, siteId, postId, 'type' );
		const template = getEditedPostValue( state, siteId, postId, 'page_template' );
		const templates = getPageTemplates( state, siteId );
		const pageForPostsId = getSiteOption( state, siteId, 'page_for_posts' );

		return { siteId, postId, postType, template, templates, pageForPostsId };
	},
	{ editPost }
)( localize( EditorPageTemplates ) );
