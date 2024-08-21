import { useLocale } from '@automattic/i18n-utils';
import clsx from 'clsx';
import { localize } from 'i18n-calypso';
import { get } from 'lodash';
import { connect } from 'react-redux';
import TaxonomyManager from 'calypso/blocks/taxonomy-manager';
import DocumentHead from 'calypso/components/data/document-head';
import InlineSupportLink from 'calypso/components/inline-support-link';
import Main from 'calypso/components/main';
import NavigationHeader from 'calypso/components/navigation-header';
import { getPostTypeTaxonomy } from 'calypso/state/post-types/taxonomies/selectors';
import { getSelectedSite, getSelectedSiteId } from 'calypso/state/ui/selectors';

import './style.scss';

const Taxonomies = ( { translate, labels, postType, taxonomy } ) => {
	const locale = useLocale();
	const taxonomyName = labels.name?.toLowerCase();

	return (
		<Main wideLayout className={ clsx( 'taxonomies', taxonomy ) }>
			<DocumentHead
				title={ translate( 'Manage %(taxonomy)s', { args: { taxonomy: labels.name } } ) }
			/>
			<NavigationHeader
				screenOptionsTab={ `edit-tags.php?taxonomy=${ taxonomy }` }
				navigationItems={ [] }
				title={ labels.name }
				subtitle={ translate(
					'Create, edit, and manage the %(taxonomy)s on your site. {{learnMoreLink/}}',
					{
						args: { taxonomy: locale === 'de' ? labels.name : taxonomyName },
						components: {
							learnMoreLink: (
								<InlineSupportLink
									key={ taxonomyName }
									supportContext={ taxonomyName }
									showIcon={ false }
								/>
							),
						},
					}
				) }
			/>
			<TaxonomyManager taxonomy={ taxonomy } postType={ postType } />
		</Main>
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
