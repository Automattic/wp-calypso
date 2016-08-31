/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { find, size, map } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import QueryPageTemplates from 'components/data/query-page-templates';
import AccordionSection from 'components/accordion/section';
import SelectDropdown from 'components/select-dropdown';
import DropdownItem from 'components/select-dropdown/item';
import EditorDrawerLabel from 'post-editor/editor-drawer/label';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getEditorPostId } from 'state/ui/editor/selectors';
import { getEditedPostValue } from 'state/posts/selectors';
import { getPageTemplates } from 'state/page-templates/selectors';
import { editPost } from 'state/posts/actions';
import EditorThemeHelp from 'post-editor/editor-theme-help';

class EditorPageTemplates extends Component {
	static propTypes = {
		siteId: PropTypes.number,
		postId: PropTypes.number,
		postType: PropTypes.string,
		template: PropTypes.string,
		templates: PropTypes.array,
		editPost: PropTypes.func
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
		const { postType, template, siteId, translate } = this.props;
		if ( 'page' !== postType ) {
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

		return { siteId, postId, postType, template, templates };
	},
	{ editPost }
)( localize( EditorPageTemplates ) );
