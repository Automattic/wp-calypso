import { Title } from '@automattic/onboarding';
import { useI18n } from '@wordpress/react-i18n';
import { useHistory } from 'react-router-dom';
import ActionCard from 'calypso/components/action-card';
import ImporterLogo from 'calypso/my-sites/importer/importer-logo';
import type * as React from 'react';
import './style.scss';

/* eslint-disable wpcalypso/jsx-classname-namespace */

const getWpComImporterUrl = ( siteSlug: string, importer: string ): string => {
	const wpComBase = 'https://wordpress.com/import/{siteSlug}?engine={importer}';

	return wpComBase.replace( '{siteSlug}', siteSlug ).replace( '{importer}', importer );
};

const getWpAdminImporterUrl = ( siteSlug: string, importer: string ): string => {
	const wpAdminBase = 'https://{siteSlug}/wp-admin/admin.php?import={importer}';

	return wpAdminBase.replace( '{siteSlug}', siteSlug ).replace( '{importer}', importer );
};

interface Props {
	siteSlug: string;
}

const ListStep: React.FunctionComponent< Props > = ( { siteSlug } ) => {
	const { __ } = useI18n();
	const history = useHistory();

	return (
		<>
			<div className={ 'import-layout list__wrapper' }>
				<div className={ 'import-layout__column' }>
					<div className="import__heading">
						<Title>{ __( 'Import your content from another platform' ) }</Title>

						<img alt="" src="/calypso/images/importer/onboarding.svg" />
					</div>
				</div>
				<div className={ 'import-layout__column' }>
					<div className={ 'list__importers list__importers-primary' }>
						<ImporterLogo icon={ 'wordpress' } />
						<ActionCard
							classNames={ 'list__importer-action' }
							headerText={ 'WordPress' }
							mainText={ 'www.wordpress.org' }
							buttonIcon={ 'chevron-right' }
							buttonHref={ getWpComImporterUrl( siteSlug, 'wordpress' ) }
						/>
						<ImporterLogo icon={ 'blogger-alt' } />
						<ActionCard
							classNames={ 'list__importer-action' }
							headerText={ 'Blogger' }
							mainText={ 'www.blogger.com' }
							buttonIcon={ 'chevron-right' }
							buttonHref={ getWpComImporterUrl( siteSlug, 'blogger' ) }
						/>
						<ImporterLogo icon={ 'medium' } />
						<ActionCard
							classNames={ 'list__importer-action' }
							headerText={ 'Medium' }
							mainText={ 'www.medium.com' }
							buttonIcon={ 'chevron-right' }
							buttonHref={ getWpComImporterUrl( siteSlug, 'medium' ) }
						/>
						<ImporterLogo icon={ 'squarespace' } />
						<ActionCard
							classNames={ 'list__importer-action' }
							headerText={ 'Squarespace' }
							mainText={ 'www.squarespace.com' }
							buttonIcon={ 'chevron-right' }
							buttonHref={ getWpComImporterUrl( siteSlug, 'squarespace' ) }
						/>
						<ImporterLogo icon={ 'wix' } />
						<ActionCard
							classNames={ 'list__importer-action' }
							headerText={ 'Wix' }
							mainText={ 'www.wix.com' }
							buttonIcon={ 'chevron-right' }
							buttonOnClick={ () => history.push( '/import?step=capture' ) }
							buttonHref={ getWpComImporterUrl( siteSlug, 'wix' ) }
						/>
					</div>

					<div className={ 'list__importers list__importers-secondary' }>
						<h3>Other platforms</h3>
						<ul>
							<li>
								<a href={ getWpAdminImporterUrl( siteSlug, 'opml' ) }>Blogroll</a>
							</li>
							<li>
								<a href={ getWpAdminImporterUrl( siteSlug, 'ghost_import' ) }>Ghost</a>
							</li>
							<li>
								<a href={ getWpAdminImporterUrl( siteSlug, 'tumblr' ) }>Tumblr</a>
							</li>
							<li>
								<a href={ getWpAdminImporterUrl( siteSlug, 'livejournal' ) }>LiveJournal</a>
							</li>
							<li>
								<a href={ getWpAdminImporterUrl( siteSlug, 'mt' ) }>Movable Type & TypePad</a>
							</li>
							<li>
								<a href={ getWpAdminImporterUrl( siteSlug, 'xanga-wxr' ) }>Xanga</a>
							</li>
						</ul>
					</div>
				</div>
			</div>
		</>
	);
};

export default ListStep;
