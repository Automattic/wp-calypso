import { localize } from 'i18n-calypso';
import { get } from 'lodash';
import page from 'page';
import { connect } from 'react-redux';
import TaxonomyManager from 'calypso/blocks/taxonomy-manager';
import DocumentHead from 'calypso/components/data/document-head';
import HeaderCake from 'calypso/components/header-cake';
import ScreenOptionsTab from 'calypso/components/screen-options-tab';
import { getPostTypeTaxonomy } from 'calypso/state/post-types/taxonomies/selectors';
import { getSelectedSite, getSelectedSiteId } from 'calypso/state/ui/selectors';

import './style.scss';

const Taxonomies = ( { translate, labels, postType, site, taxonomy } ) => {
	const goBack = () => {
		page( '/settings/writing/' + site.slug );
	};

	return (
		/* eslint-disable wpcalypso/jsx-classname-namespace */
		<div className="main main-column" role="main">
			<ScreenOptionsTab wpAdminPath={ `edit-tags.php?taxonomy=${ taxonomy }` } />
			<DocumentHead
				title={ translate( 'Manage %(taxonomy)s', { args: { taxonomy: labels.name } } ) }
			/>
			<HeaderCake onClick={ goBack } className="header-cake--has-screen-options">
				<h1>{ labels.name }</h1>
			</HeaderCake>
			<TaxonomyManager taxonomy={ taxonomy } postType={ postType } />
		</div>
	);
};

export default localize(
	connect( ( state, { taxonomy, postType } ) => {
		const siteId = getSelectedSiteId( state );
		const site = getSelectedSite( state );
		const labels = get( getPostTypeTaxonomy( state, siteId, postType, taxonomy ), 'labels', {} );
		return {
			site,
			labels,
		};
	} )( Taxonomies )
);
