import { Title, SubTitle, NextButton } from '@automattic/onboarding';
import { sprintf } from '@wordpress/i18n';
import { Icon, check } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import classnames from 'classnames';
import React, { useState } from 'react';
import { UrlData } from 'calypso/signup/steps/import/types';
import { convertToFriendlyWebsiteName } from 'calypso/signup/steps/import/util';
import ConfirmModal from './confirm-modal';
import type { SitesItem } from 'calypso/state/selectors/get-sites-items';

import './style.scss';

interface Props {
	sourceSite: SitesItem | null;
	sourceSiteUrl: string;
	sourceUrlAnalyzedData: UrlData;
	targetSite: SitesItem | null;
	targetSiteSlug: string;
	startImport: () => void;
}

export const Confirm: React.FunctionComponent< Props > = ( props ) => {
	const { __ } = useI18n();

	/**
	 ↓ Fields
	 */
	const { sourceSiteUrl, sourceUrlAnalyzedData, targetSite, targetSiteSlug, startImport } = props;
	const [ isModalDetailsOpen, setIsModalDetailsOpen ] = useState( false );

	return (
		<>
			<div className={ classnames( 'import__import-everything' ) }>
				<div className={ classnames( 'import__site-mapper' ) }>
					<div className={ classnames( 'import-layout', 'import__site-mapper-border' ) }>
						<div className={ classnames( 'import-layout__column' ) }>
							<div
								className={ classnames( 'import__site-mapper-header import__site-mapper-border' ) }
							>
								{ __( 'Original site' ) }
							</div>

							<div
								className={ classnames( 'import_site-mapper-name', {
									'with-favicon': sourceUrlAnalyzedData?.meta.favicon,
								} ) }
							>
								{ sourceUrlAnalyzedData?.meta.favicon && (
									<img alt={ 'Icon' } src={ sourceUrlAnalyzedData?.meta.favicon } />
								) }
								<span>{ sourceUrlAnalyzedData?.meta.title }</span>
								<small>{ convertToFriendlyWebsiteName( sourceSiteUrl ) }</small>
							</div>
						</div>
						<div className={ classnames( 'import-layout__column' ) }>
							<div
								className={ classnames( 'import__site-mapper-header import__site-mapper-border' ) }
							>
								{ __( 'New site' ) }
							</div>

							<div className={ classnames( 'import_site-mapper-name' ) }>
								<span>{ targetSite?.name }</span>
								<small>{ convertToFriendlyWebsiteName( targetSiteSlug ) }</small>
							</div>
						</div>
					</div>
				</div>

				<Title>
					{ sprintf(
						/* translators: the `from` and `to` fields could be any site URL (eg: "yourname.com") */
						__( 'Import everything from %(from)s and overwrite everything on %(to)s?' ),
						{
							from: convertToFriendlyWebsiteName( sourceSiteUrl ),
							to: convertToFriendlyWebsiteName( targetSiteSlug ),
						}
					) }
				</Title>

				<ul className={ classnames( 'import__details-list' ) }>
					<li>
						<Icon size={ 20 } icon={ check } /> { __( 'All posts, pages, comments, and media' ) }
					</li>
					<li>
						<Icon size={ 20 } icon={ check } /> { __( 'Add users and roles' ) }
					</li>
					<li>
						<Icon size={ 20 } icon={ check } /> { __( 'Theme, plugins, and settings' ) }
					</li>
				</ul>

				<SubTitle>
					{ __(
						'Your site will keep working, but your WordPress.com dashboard will be locked during importing.'
					) }
				</SubTitle>

				<NextButton onClick={ () => setIsModalDetailsOpen( true ) }>
					{ __( 'Start import' ) }
				</NextButton>
			</div>

			{ isModalDetailsOpen && (
				<ConfirmModal
					siteSlug={ targetSiteSlug }
					onConfirm={ startImport }
					onClose={ () => setIsModalDetailsOpen( false ) }
				/>
			) }
		</>
	);
};
