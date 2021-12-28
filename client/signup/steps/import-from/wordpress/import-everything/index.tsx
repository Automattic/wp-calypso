import { Title, SubTitle, NextButton } from '@automattic/onboarding';
import { sprintf } from '@wordpress/i18n';
import { Icon, check } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import classnames from 'classnames';
import React from 'react';
import { convertToFriendlyWebsiteName } from 'calypso/signup/steps/import/util';

import './style.scss';

interface Props {
	fromSite: string;
	siteSlug: string;
}

export const ImportEverything: React.FunctionComponent< Props > = ( props ) => {
	const { __ } = useI18n();
	const { fromSite, siteSlug } = props;

	return (
		<div className={ classnames( 'import__import-everything' ) }>
			<div className={ classnames( 'import__site-mapper' ) }>
				<div className={ classnames( 'import-layout', 'import__site-mapper-border' ) }>
					<div className={ classnames( 'import-layout__column' ) }>
						<div
							className={ classnames(
								'import-layout__column',
								'import__site-mapper-header',
								'import__site-mapper-border'
							) }
						>
							{ __( 'Original site' ) }
						</div>

						<div className={ classnames( 'import_site-mapper-name' ) }>
							OpenWeb
							<span>{ fromSite }</span>
						</div>
					</div>
					<div className={ classnames( 'import-layout__column' ) }>
						<div
							className={ classnames(
								'import-layout__column import__site-mapper-header import__site-mapper-border'
							) }
						>
							{ __( 'New site' ) }
						</div>

						<div className={ classnames( 'import_site-mapper-name' ) }>
							OpenWeb
							<span>{ siteSlug }</span>
						</div>
					</div>
				</div>
			</div>

			<Title tagName={ 'h3' }>
				{ sprintf(
					/* translators: the `from` and `to` fields could be any site URL (eg: "yourname.com") */
					__( 'Import everything from %(from)s and overwrite everything on %(to)s?' ),
					{
						from: convertToFriendlyWebsiteName( fromSite ),
						to: convertToFriendlyWebsiteName( siteSlug ),
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

			<NextButton>{ __( 'Start import' ) }</NextButton>
		</div>
	);
};
