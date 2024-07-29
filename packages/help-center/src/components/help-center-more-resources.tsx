/* eslint-disable no-restricted-imports */
/* eslint-disable wpcalypso/jsx-classname-namespace */
import { recordTracksEvent } from '@automattic/calypso-analytics';
import { localizeUrl } from '@automattic/i18n-utils';
import WhatsNewGuide, { useWhatsNewAnnouncementsQuery } from '@automattic/whats-new';
import { Button, SVG, Circle } from '@wordpress/components';
import { useSelect, useDispatch } from '@wordpress/data';
import { useState } from '@wordpress/element';
import { Icon, captureVideo, formatListNumbered, external, institution } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import { useHelpCenterContext } from '../contexts/HelpCenterContext';
import { NewReleases } from '../icons';
import { HELP_CENTER_STORE } from '../stores';
import type { HelpCenterSelect } from '@automattic/data-stores';

const circle = (
	<SVG viewBox="0 0 24 24">
		<Circle cx="12" cy="12" r="5" />
	</SVG>
);

type CoreDataPlaceholder = {
	hasFinishedResolution: ( ...args: unknown[] ) => boolean;
};

export const HelpCenterMoreResources = () => {
	const { __ } = useI18n();
	const { sectionName, site } = useHelpCenterContext();
	const { data } = useWhatsNewAnnouncementsQuery( site?.ID );

	const showWhatsNewItem = data && data.length > 0;

	const { hasSeenWhatsNewModal, doneLoading } = useSelect(
		( select ) => ( {
			hasSeenWhatsNewModal: (
				select( HELP_CENTER_STORE ) as HelpCenterSelect
			 ).getHasSeenWhatsNewModal(),
			doneLoading: ( select( 'core/data' ) as CoreDataPlaceholder ).hasFinishedResolution(
				HELP_CENTER_STORE,
				'getHasSeenWhatsNewModal',
				[]
			),
		} ),
		[]
	);

	const { setHasSeenWhatsNewModal } = useDispatch( HELP_CENTER_STORE );

	const showWhatsNewDot = doneLoading && ! hasSeenWhatsNewModal;

	const [ showGuide, setShowGuide ] = useState( false );

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

	const handleWhatsNewClick = () => {
		if ( ! hasSeenWhatsNewModal ) {
			setHasSeenWhatsNewModal( true );
		}
		setShowGuide( true );
		trackMoreResourcesButtonClick( 'whats-new' );
	};

	return (
		<>
			<h3 className="help-center__section-title">
				{ __( 'More Resources', __i18n_text_domain__ ) }
			</h3>
			<ul className="inline-help__more-resources" aria-labelledby="inline-help__more-resources">
				<li className="inline-help__resource-item">
					<div className="inline-help__resource-cell">
						<a
							href={ localizeUrl( 'https://wordpress.com/support' ) }
							rel="noreferrer"
							target="_blank"
							className="inline-help__format-list-numbered"
							onClick={ () => trackMoreResourcesButtonClick( 'support-documentation' ) }
						>
							<Icon icon={ formatListNumbered } size={ 24 } />
							<span>{ __( 'Support Guides', __i18n_text_domain__ ) }</span>
							<Icon icon={ external } size={ 20 } />
						</a>
					</div>
				</li>
				<li className="inline-help__resource-item">
					<div className="inline-help__resource-cell">
						<a
							href={ localizeUrl( 'https://wordpress.com/webinars/' ) }
							rel="noreferrer"
							target="_blank"
							onClick={ () => trackLearnButtonClick( 'webinairs' ) }
							className="inline-help__capture-video"
						>
							<Icon icon={ captureVideo } size={ 24 } />
							<span>{ __( 'Webinars', __i18n_text_domain__ ) }</span>
							<Icon icon={ external } size={ 20 } />
						</a>
					</div>
				</li>
				<li className="inline-help__resource-item">
					<div className="inline-help__resource-cell">
						<a
							href={ localizeUrl( 'https://wordpress.com/courses/' ) }
							rel="noreferrer"
							target="_blank"
							onClick={ () => trackLearnButtonClick( 'courses' ) }
							className="inline-help__institution"
						>
							<Icon icon={ institution } size={ 24 } />
							<span>{ __( 'Courses', __i18n_text_domain__ ) }</span>
							<Icon icon={ external } size={ 20 } />
						</a>
					</div>
				</li>
				{ showWhatsNewItem && (
					<li className="inline-help__resource-item">
						<div className="inline-help__resource-cell">
							<Button
								variant="link"
								onClick={ handleWhatsNewClick }
								className="inline-help__new-releases"
							>
								<Icon icon={ <NewReleases /> } size={ 24 } />
								<span>{ __( "What's New", __i18n_text_domain__ ) }</span>
								{ showWhatsNewDot && (
									<Icon className="inline-help__new-releases_dot" icon={ circle } size={ 16 } />
								) }
							</Button>
						</div>
					</li>
				) }
			</ul>
			{ showGuide && site && (
				<WhatsNewGuide onClose={ () => setShowGuide( false ) } siteId={ site.ID } />
			) }
		</>
	);
};
