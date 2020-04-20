/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { identity } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Accordion from 'components/accordion';
import { Button } from '@automattic/components';
import AccordionSection from 'components/accordion/section';
import CountedTextarea from 'components/forms/counted-textarea';
import WebPreview from 'components/web-preview';
import EditorDrawerLabel from 'post-editor/editor-drawer/label';
import { isJetpackSite } from 'state/sites/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import { updatePostMetadata } from 'state/posts/actions';
import { getEditorPostId } from 'state/ui/editor/selectors';
import { getEditedPost } from 'state/posts/selectors';
import PostMetadata from 'lib/post-metadata';

/**
 * Style dependencies
 */
import './style.scss';

class EditorSeoAccordion extends Component {
	static propTypes = {
		translate: PropTypes.func,
		metaDescription: PropTypes.string,
	};

	static defaultProps = {
		metaDescription: '',
		translate: identity,
	};

	state = { showPreview: false };

	showPreview = () => this.setState( { showPreview: true } );
	hidePreview = () => this.setState( { showPreview: false } );

	onMetaChange = ( event ) => {
		this.props.updatePostMetadata( this.props.siteId, this.props.postId, {
			advanced_seo_description: event.target.value,
		} );
	};

	render() {
		const { translate, metaDescription, isJetpack } = this.props;
		const { showPreview } = this.state;

		return (
			<Accordion
				title={ translate( 'SEO Description' ) }
				className="editor-seo-accordion"
				e2eTitle="seo"
			>
				<AccordionSection>
					<EditorDrawerLabel
						helpText={ translate(
							'Craft a description of your post for search engine results. ' +
								'The post content is used by default.'
						) }
						labelText={ translate( 'Meta Description' ) }
					/>
					<CountedTextarea
						maxLength="300"
						acceptableLength={ 159 }
						placeholder={ translate( 'Write a description…' ) }
						aria-label={ translate( 'Write a description…' ) }
						value={ metaDescription }
						onChange={ this.onMetaChange }
					/>
					{ isJetpack && (
						<div>
							<Button className="editor-seo-accordion__preview-button" onClick={ this.showPreview }>
								{ translate( 'Preview' ) }
							</Button>
							<WebPreview
								showPreview={ showPreview }
								onClose={ this.hidePreview }
								showDeviceSwitcher={ false }
								showExternal={ false }
								defaultViewportDevice="seo"
								frontPageMetaDescription={ metaDescription }
							/>
						</div>
					) }
				</AccordionSection>
			</Accordion>
		);
	}
}

export default connect(
	( state ) => {
		const siteId = getSelectedSiteId( state );
		const postId = getEditorPostId( state );
		const post = getEditedPost( state, siteId, postId );
		const isJetpack = isJetpackSite( state, siteId );
		const metaDescription = PostMetadata.metaDescription( post );

		return { siteId, postId, isJetpack, metaDescription };
	},
	{
		updatePostMetadata,
	}
)( localize( EditorSeoAccordion ) );
