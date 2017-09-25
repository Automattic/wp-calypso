/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import { get } from 'lodash';
import page from 'page';
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import TaxonomyManager from 'blocks/taxonomy-manager';
import DocumentHead from 'components/data/document-head';
import HeaderCake from 'components/header-cake';
import { getPostTypeTaxonomy } from 'state/post-types/taxonomies/selectors';
import { getSelectedSite, getSelectedSiteId } from 'state/ui/selectors';

const Taxonomies = ( { translate, labels, postType, site, taxonomy } ) => {
	const goBack = () => {
		page( '/settings/writing/' + site.slug );
	};

	return (
		<div className="main main-column" role="main">
			<DocumentHead title={ translate( 'Manage %(taxonomy)s', { args: { taxonomy: labels.name } } ) } />
			<HeaderCake onClick={ goBack }>
				<h1>{ labels.name }</h1>
			</HeaderCake>
			<TaxonomyManager taxonomy={ taxonomy } postType={ postType } />
		</div>
	);
};

export default localize( connect(
	( state, { taxonomy, postType } ) => {
		const siteId = getSelectedSiteId( state );
		const site = getSelectedSite( state );
		const labels = get( getPostTypeTaxonomy( state, siteId, postType, taxonomy ), 'labels', {} );
		return {
			site,
			labels
		};
	}
)( Taxonomies ) );
