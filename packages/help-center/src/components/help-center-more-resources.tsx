/* eslint-disable no-restricted-imports */
/* eslint-disable wpcalypso/jsx-classname-namespace */
import { recordTracksEvent } from '@automattic/calypso-analytics';
import { localizeUrl } from '@automattic/i18n-utils';
import { Icon, formatListNumbered, external, institution } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import { useHelpCenterContext } from '../contexts/HelpCenterContext';

import './help-center-more-resources.scss';

export const HelpCenterMoreResources = () => {
	const { __ } = useI18n();
	const { sectionName } = useHelpCenterContext();

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
				{ __( 'More Resources', __i18n_text_domain__ ) }
			</h3>
			<ul
				className="help-center-more-resources__resources"
				aria-labelledby="help-center-more-resources__resources"
			>
				<li className="help-center-more-resources__resource-item help-center-link__item">
					<div className="help-center-more-resources__resource-cell help-center-link__cell">
						<a
							href={ localizeUrl( 'https://wordpress.com/support' ) }
							rel="noreferrer"
							target="_blank"
							className="help-center-more-resources__format-list-numbered"
							onClick={ () => trackMoreResourcesButtonClick( 'support-documentation' ) }
						>
							<Icon icon={ formatListNumbered } size={ 24 } />
							<span>{ __( 'Support Guides', __i18n_text_domain__ ) }</span>
							<Icon icon={ external } size={ 20 } />
						</a>
					</div>
				</li>
				<li className="help-center-more-resources__resource-item help-center-link__item">
					<div className="help-center-more-resources__resource-cell help-center-link__cell">
						<a
							href={ localizeUrl( 'https://wordpress.com/courses/' ) }
							rel="noreferrer"
							target="_blank"
							onClick={ () => trackLearnButtonClick( 'courses' ) }
							className="help-center-more-resources__institution"
						>
							<Icon icon={ institution } size={ 24 } />
							<span>{ __( 'Courses', __i18n_text_domain__ ) }</span>
							<Icon icon={ external } size={ 20 } />
						</a>
					</div>
				</li>
			</ul>
		</div>
	);
};
