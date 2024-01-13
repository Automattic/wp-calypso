import { Button, FoldableCard, Gridicon } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Fragment, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ExternalLink from 'calypso/components/external-link';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormLabel from 'calypso/components/forms/form-label';
import FormSelect from 'calypso/components/forms/form-select';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import InlineSupportLink from 'calypso/components/inline-support-link';
import useDropdownPagesQuery from 'calypso/data/dropdown-pages/use-dropdown-pages';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { successNotice } from 'calypso/state/notices/actions';
import { updateSiteFrontPage } from 'calypso/state/sites/actions';
import { getSiteFrontPageType, getSiteUrl } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

import './style.scss';

const noop = () => {};

const BlogPostsPage = () => {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const [ selectedPageId, setSelectedPageId ] = useState( '' );
	const [ isExpanded, setIsExpanded ] = useState( false );
	const [ hasUpdatedHomepage, setHasUpdatedHomepage ] = useState( false );

	const siteId = useSelector( ( state ) => getSelectedSiteId( state ) );
	const isCurrentlySetAsHomepage =
		useSelector( ( state ) => getSiteFrontPageType( state, siteId ) ) === 'posts';
	const postPagesLink = useSelector( ( state ) => getSiteUrl( state, siteId ) );

	const renderPageOptions = ( pages, level = 0 ) => {
		// Indent child pages.
		const indentation = Array.from( { length: level }, () => '—' ).join( '' );

		return pages.map( ( page ) => (
			<Fragment key={ page.ID }>
				<option key={ page.ID } value={ page.ID }>
					{ indentation } { page.title }
				</option>
				{ page.children && renderPageOptions( page.children, level + 1 ) }
			</Fragment>
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
		const { data: pages } = useDropdownPagesQuery( siteId );

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
		setHasUpdatedHomepage( true );
		dispatch(
			updateSiteFrontPage( siteId, {
				show_on_front: 'page',
				page_on_front: selectedPageId,
			} )
		);
		dispatch(
			successNotice( translate( 'Homepage successfully updated.' ), {
				id: 'homepage-update-notice',
				duration: 4000,
			} )
		);
	};

	const handleCardClick = () => {
		setIsExpanded( ! isExpanded );
	};

	const recordCalloutClick = () => {
		dispatch( recordTracksEvent( 'calypso_pages_blog_posts_callout_click', { blog_id: siteId } ) );
	};

	const changeDefaultHomepageOption = useChangeDefaultHomepageOption();

	if ( ! isCurrentlySetAsHomepage ) {
		return;
	}

	return (
		<FoldableCard
			className="blog-posts-page__info"
			header={ renderPostsPageInfo() }
			onClick={ handleCardClick }
			icon={ isExpanded ? 'chevron-down' : 'cog' }
		>
			<FormFieldset className="blog-posts-page__change-option">
				<FormLabel>{ translate( 'Change homepage:' ) } </FormLabel>
				{ changeDefaultHomepageOption }
				<FormSettingExplanation className="blog-posts-page__explanation">
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
				</FormSettingExplanation>
			</FormFieldset>
			<div className="blog-posts-page__actions">
				<ExternalLink
					className="blog-posts-page__link"
					onClick={ recordCalloutClick }
					href={ postPagesLink }
					target="_blank"
					rel="noopener noreferrer"
					icon
				>
					{ translate( 'Preview homepage' ) }
				</ExternalLink>
				<Button disabled={ ! selectedPageId.length || hasUpdatedHomepage } onClick={ setFrontPage }>
					{ translate( 'Save' ) }
				</Button>
			</div>
		</FoldableCard>
	);
};

BlogPostsPage.propTypes = {
	translate: PropTypes.func,
	recordCalloutClick: PropTypes.func,
	updateSiteFrontPage: PropTypes.func,
	successNotice: PropTypes.func,
};

BlogPostsPage.defaultProps = {
	recordCalloutClick: noop,
};

export default BlogPostsPage;
