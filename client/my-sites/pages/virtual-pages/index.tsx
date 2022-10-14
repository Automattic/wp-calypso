import { CompactCard, Gridicon } from '@automattic/components';
import { useTemplates } from '@automattic/data-stores';
import { decodeEntities } from '@wordpress/html-entities';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import { useBlockEditorSettingsQuery } from 'calypso/data/block-editor/use-block-editor-settings-query';
import { addQueryArgs } from 'calypso/lib/route';
import { getSiteFrontPageType } from 'calypso/state/sites/selectors';
import './style.scss';

interface Props {
	site: any;
}

const VirtualPages = ( { site }: Props ) => {
	const translate = useTranslate();
	const frontPageType = useSelector( ( state ) => getSiteFrontPageType( state, site.ID ) );
	const isFrontPage = frontPageType === 'posts';
	const { data: templates } = useTemplates( site.ID, { enabled: isFrontPage } );
	const { data: blockEditorSettings } = useBlockEditorSettingsQuery( site.ID, isFrontPage );

	if ( ! isFrontPage || ! templates ) {
		return null;
	}

	return (
		<div className="virtual-pages">
			{ templates
				.filter( ( template ) => ! template.is_custom )
				.map( ( { id, type, title, slug, description } ) => (
					<CompactCard
						key={ id }
						className="virtual-pages__page"
						href={ addQueryArgs(
							{ templateId: id, templateType: type },
							`/site-editor/${ site.slug }`
						) }
						target="_blank"
						rel="noopener noreferrer"
					>
						<div className="virtual-pages__page-title">
							<span>{ decodeEntities( title.rendered || slug ) }</span>
							{ id === blockEditorSettings?.home_template?.postId && (
								<span className="virtual-pages__page-badge">
									<Gridicon icon="house" size={ 12 } className="virtual-pages__page-badge-icon" />
									<span className="virtual-pages__page-badge-text">
										{ translate( 'Homepage' ) }
									</span>
								</span>
							) }
						</div>
						<div className="virtual-pages__page-info">
							<span>{ description }</span>
						</div>
					</CompactCard>
				) ) }
		</div>
	);
};

export default VirtualPages;
