import classnames from 'classnames';
import { localize } from 'i18n-calypso';
import { get } from 'lodash';
import { connect } from 'react-redux';
import TaxonomyManager from 'calypso/blocks/taxonomy-manager';
import DocumentHead from 'calypso/components/data/document-head';
import FormattedHeader from 'calypso/components/formatted-header';
import InlineSupportLink from 'calypso/components/inline-support-link';
import Main from 'calypso/components/main';
import ScreenOptionsTab from 'calypso/components/screen-options-tab';
import { getPostTypeTaxonomy } from 'calypso/state/post-types/taxonomies/selectors';
import { getSelectedSite, getSelectedSiteId } from 'calypso/state/ui/selectors';

import './style.scss';

const Taxonomies = ( { translate, labels, postType, taxonomy } ) => {
	const taxonomyName = labels.name?.toLowerCase();

	return (
		<Main wideLayout className={ classnames( 'taxonomies', taxonomy ) }>
			<ScreenOptionsTab wpAdminPath={ `edit-tags.php?taxonomy=${ taxonomy }` } />
			<DocumentHead
				title={ translate( 'Manage %(taxonomy)s', { args: { taxonomy: labels.name } } ) }
			/>
			<FormattedHeader
				brandFont
				headerText={ labels.name }
				subHeaderText={ translate(
					'Create, edit, and manage the %(taxonomy)s on your site. {{learnMoreLink/}}',
					{
						args: { taxonomy: taxonomyName },
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
				align="left"
				hasScreenOptions
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
