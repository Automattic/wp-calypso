/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import identity from 'lodash/identity';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Accordion from 'components/accordion';
import Button from 'components/button';
import AccordionSection from 'components/accordion/section';
import CountedTextarea from 'components/forms/counted-textarea';
import PostActions from 'lib/posts/actions';
import EditorDrawerLabel from 'post-editor/editor-drawer/label';
import WebPreview from 'components/web-preview';
import { isJetpackSite } from 'state/sites/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';

class EditorSeoAccordion extends Component {
	static propTypes = {
		translate: PropTypes.func,
		metaDescription: PropTypes.string
	};

	static defaultProps = {
		metaDescription: '',
		translate: identity
	};

	constructor( props ) {
		super( props );

		this.showPreview = this.showPreview.bind( this );
		this.hidePreview = this.hidePreview.bind( this );

		this.state = { showPreview: false };
	}

	showPreview() {
		this.setState( { showPreview: true } );
	}

	hidePreview() {
		this.setState( { showPreview: false } );
	}

	render() {
		const { translate, metaDescription, isJetpack } = this.props;
		const { showPreview } = this.state;

		return (
			<Accordion
				title={ translate( 'SEO Description' ) }
				className="editor-seo-accordion"
			>
				<AccordionSection>
					<EditorDrawerLabel
						helpText={ translate(
							'Craft a description of your post for search engine results. ' +
							'The post content is used by default.'
						) }
						labelText={ translate( 'Meta Description' ) }
					>
						<CountedTextarea
							maxLength="300"
							acceptableLength={ 159 }
							placeholder={ translate( 'Write a description…' ) }
							aria-label={ translate( 'Write a description…' ) }
							value={ metaDescription }
							onChange={ onMetaChange }
						/>
					</EditorDrawerLabel>
					{ isJetpack &&
						<div>
							<Button
								className="editor-seo-accordion__preview-button"
								onClick={ this.showPreview }
							>
								{ translate( 'Preview' ) }
							</Button>
							<WebPreview
								showPreview={ showPreview }
								onClose={ this.hidePreview }
								showDeviceSwitcher={ false }
								showExternal={ false }
								defaultViewportDevice="seo"
							/>
						</div>
					}
				</AccordionSection>
			</Accordion>
		);
	}
}

function onMetaChange( event ) {
	PostActions.updateMetadata( {
		advanced_seo_description: event.target.value
	} );
}

const mapStateToProps = ( state ) => {
	const siteId = getSelectedSiteId( state );

	return {
		isJetpack: isJetpackSite( state, siteId )
	};
};

export default connect(
	mapStateToProps,
	null,
	null,
	{ pure: false } // defaults to true, but this component has internal state
)( localize( EditorSeoAccordion ) );
