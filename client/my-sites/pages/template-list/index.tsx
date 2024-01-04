import { useTemplates } from '@automattic/data-stores';
import { useTranslate } from 'i18n-calypso';
import { connect } from 'react-redux';
import SectionHeader from 'calypso/components/section-header';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import VirtualPage from '../virtual-page';
import type { SiteDetails } from '@automattic/data-stores';
import './style.scss';

interface Props {
	site: SiteDetails;
	isAdmin: boolean;
}

const TEMPLATE_SLUGS_TO_SHOW = [ '404', 'search' ];

const TemplateList = ( { site, isAdmin }: Props ) => {
	const translate = useTranslate();
	const { data: allTemplates } = useTemplates( site.ID, { enabled: isAdmin } );
	const templates = allTemplates?.filter( ( { slug } ) => TEMPLATE_SLUGS_TO_SHOW.includes( slug ) );

	if ( ! templates || ! templates.length ) {
		return null;
	}

	return (
		<div id="templates" className="pages__template-list">
			<SectionHeader label={ translate( 'Templates' ) } />
			{ templates.map( ( template ) => {
				return (
					<VirtualPage
						key={ template.id }
						site={ site }
						id={ template.id }
						type={ template.type }
						title={ template.title?.rendered || template.slug }
						hasLoaded
					/>
				);
			} ) }
		</div>
	);
};

const mapStateToProps = ( state: any, ownProps: Props ) => {
	return {
		isAdmin: canCurrentUser( state, ownProps.site.ID, 'edit_theme_options' ),
	};
};

export default connect( mapStateToProps )( TemplateList );
