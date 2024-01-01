import { Button, FoldableCard, Gridicon } from '@automattic/components';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { connect } from 'react-redux';
import ExternalLink from 'calypso/components/external-link';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormLabel from 'calypso/components/forms/form-label';
import FormSelect from 'calypso/components/forms/form-select';
import InlineSupportLink from 'calypso/components/inline-support-link';
import useDropdownPagesQuery from 'calypso/data/dropdown-pages/use-dropdown-pages';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { successNotice } from 'calypso/state/notices/actions';
import { updateSiteFrontPage } from 'calypso/state/sites/actions';
import {
	getSiteFrontPageType,
	getSitePostsPage,
	getSiteFrontPage,
} from 'calypso/state/sites/selectors';

import './style.scss';

const noop = () => {};

const BlogPostsPage = ( props ) => {
	const { site, frontPageType, translate, recordCalloutClick, updateFrontPage, displayNotice } =
		props;
	const isCurrentlySetAsHomepage = frontPageType === 'posts';

	const [ selectedPageId, setSelectedPageId ] = useState( '' );
	const [ isExpanded, setIsExpanded ] = useState( false );

	const getPostsPageLink = () => site.URL;

	const renderPageOptions = ( pages, level = 0 ) => {
		const indentation = Array.from( { length: level }, () => '—' ).join( '' );

		return pages.map( ( page ) => (
			<React.Fragment key={ page.ID }>
				<option key={ page.ID } value={ page.ID }>
					{ indentation } { page.title }
				</option>
				{ page.children && renderPageOptions( page.children, level + 1 ) }
			</React.Fragment>
		) );
	};

	const renderPostsPageInfo = () => {
		return (
			<span>
				<Gridicon size={ 12 } icon="house" className="blog-posts-page__front-page-icon" />
				{ translate( 'The homepage is showing your latest posts.' ) }
			</span>
		);
	};

	const useChangeDefaultHomepageOption = () => {
		const { data: pages } = useDropdownPagesQuery( site.ID );

		return (
			<FormSelect
				onChange={ ( event ) => setSelectedPageId( event.target.value ) }
				value={ selectedPageId }
			>
				<option value="">{ translate( '—— Default ——' ) }</option>
				{ pages?.dropdown_pages && renderPageOptions( pages.dropdown_pages ) }
			</FormSelect>
		);
	};

	const setFrontPage = () => {
		updateFrontPage( site.ID, {
			show_on_front: 'page',
			page_on_front: selectedPageId,
		} );
		displayNotice( translate( 'Default homepage successfully updated!' ), {
			id: 'default-homepage-notice',
			duration: 4000,
		} );
	};

	const handleClick = () => {
		setIsExpanded( ! isExpanded );
		recordCalloutClick( site.ID );
	};

	const changeDefaultHomepageOption = useChangeDefaultHomepageOption();

	if ( ! isCurrentlySetAsHomepage ) {
		return;
	}

	return (
		<FoldableCard
			className="blog-posts-page__info"
			header={ renderPostsPageInfo() }
			onClick={ handleClick }
			icon={ isExpanded ? 'chevron-down' : 'cog' }
		>
			<FormFieldset className="blog-posts-page__change-option">
				<FormLabel>{ translate( 'Change homepage:' ) } </FormLabel>
				{ changeDefaultHomepageOption }
				<p className="blog-posts-page__explanation">
					{ translate(
						"The default homepage's content and layout is determined by your active theme. {{aboutTemplatesLink}}Learn more{{/aboutTemplatesLink}}.",
						{
							components: {
								aboutTemplatesLink: (
									<InlineSupportLink supportContext="front-page" showIcon={ false } />
								),
							},
						}
					) }
				</p>
			</FormFieldset>
			<div className="blog-posts-page__actions">
				<ExternalLink href={ getPostsPageLink() } target="_blank" rel="noopener noreferrer" icon>
					{ translate( 'Preview homepage' ) }
				</ExternalLink>
				<Button disabled={ ! selectedPageId.length } onClick={ setFrontPage }>
					{ translate( 'Save' ) }
				</Button>
			</div>
		</FoldableCard>
	);
};

BlogPostsPage.propTypes = {
	site: PropTypes.object,
	frontPageType: PropTypes.string,
	postsPage: PropTypes.object,
	translate: PropTypes.func,
	recordCalloutClick: PropTypes.func,
	updateSiteFrontPage: PropTypes.func,
	successNotice: PropTypes.func,
};

BlogPostsPage.defaultProps = {
	recordCalloutClick: noop,
};

const mapDispatchToProps = ( dispatch ) => ( {
	recordCalloutClick: ( siteId ) => {
		dispatch( recordTracksEvent( 'calypso_pages_blog_posts_callout_click', { blog_id: siteId } ) );
	},
	updateFrontPage: ( siteId, frontPageData ) =>
		dispatch( updateSiteFrontPage( siteId, frontPageData ) ),
	displayNotice: ( text, options ) => dispatch( successNotice( text, options ) ),
} );

export default connect(
	( state, props ) => ( {
		frontPageType: getSiteFrontPageType( state, props.site.ID ),
		isFrontPage: getSiteFrontPageType( state, props.site.ID ) === 'posts',
		postsPage: getSitePostsPage( state, props.site.ID ),
		frontPage: getSiteFrontPage( state, props.site.ID ),
	} ),
	mapDispatchToProps
)( localize( BlogPostsPage ) );
