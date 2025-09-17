/* eslint-disable no-restricted-imports */
/* eslint-disable wpcalypso/jsx-classname-namespace */
import { recordTracksEvent } from '@automattic/calypso-analytics';
import { localizeUrl } from '@automattic/i18n-utils';
import { backup, chevronRight, external, Icon, rss, video } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import { useNavigate } from 'react-router-dom';
import { useHelpCenterContext } from '../contexts/HelpCenterContext';

import './help-center-more-resources.scss';

export const HelpCenterMoreResources = () => {
	const { __ } = useI18n();
	const { sectionName } = useHelpCenterContext();
	const navigate = useNavigate();

	const trackMoreResourcesButtonClick = ( resource: string ) => {
		recordTracksEvent( 'calypso_help_moreresources_click', {
			resource: resource,
			force_site_id: true,
			location: 'help-center',
			section: sectionName,
		} );
	};

	const trackLearnButtonClick = ( resourceType: string ) => {
		recordTracksEvent( 'calypso_help_courses_click', {
			force_site_id: true,
			location: 'help-center',
			section: sectionName,
		} );
		trackMoreResourcesButtonClick( resourceType );
	};

	return (
		<div className="help-center-more-resources">
			<h3 className="help-center__section-title">
				{ __( 'More resources', __i18n_text_domain__ ) }
			</h3>
			<ul aria-labelledby="help-center-more-resources__resources">
				<li className="help-center-more-resources__resource-item help-center-link__item">
					<div className="help-center-more-resources__resource-cell help-center-link__cell">
						<button
							type="button"
							onClick={ () => {
								trackMoreResourcesButtonClick( 'support-history' );
								navigate( '/chat-history' );
							} }
							className="help-center-more-resources__support-history"
						>
							<Icon icon={ backup } size={ 24 } />
							<span>{ __( 'Support history', __i18n_text_domain__ ) }</span>
							<Icon icon={ chevronRight } size={ 20 } />
						</button>
					</div>
				</li>
				<li className="help-center-more-resources__resource-item help-center-link__item">
					<div className="help-center-more-resources__resource-cell help-center-link__cell">
						<a
							href={ localizeUrl( 'https://wordpress.com/support/courses' ) }
							rel="noreferrer"
							target="_blank"
							onClick={ () => trackLearnButtonClick( 'courses' ) }
							className="help-center-more-resources__institution"
						>
							<Icon icon={ video } size={ 24 } />
							<span>{ __( 'Courses', __i18n_text_domain__ ) }</span>
							<Icon icon={ external } size={ 20 } />
						</a>
					</div>
				</li>
				<li className="help-center-more-resources__resource-item help-center-link__item">
					<div className="help-center-more-resources__resource-cell help-center-link__cell">
						<a
							href={ localizeUrl( 'https://wordpress.com/blog/category/product-features/' ) }
							rel="noreferrer"
							target="_blank"
							className="help-center-more-resources__product-updates"
							onClick={ () => trackMoreResourcesButtonClick( 'product-updates' ) }
						>
							<Icon icon={ rss } size={ 24 } />
							<span>{ __( 'Product updates', __i18n_text_domain__ ) }</span>
							<Icon icon={ external } size={ 20 } />
						</a>
					</div>
				</li>
			</ul>
		</div>
	);
};
